// TODO Make it so multiple attr w/o a value counts

/* Keep track of our instantiated Optis in case
we need to manipulate them later */
window.optis = [];

class Opti {
	settings; 	// Parsed options
	i; 			// Index of this instance
	s; 			// Select element as a jQuery object
	l; 			// Select's label if present (either as a parent or using the 'for' attribute)
	o; 			// The actual Opti div as a jQuery object
	groupCount; // This will enumerate the indexes of the select's optgroups so that we can identify which ones are removed if they are removed from the original select.
	ogTabindex; // The tabindex on the original select before we nuke it, so that we can restore it if Opti is destroyed.
	ufoap;		// Compouted "user first option as placeholder"

	// Convenience selectors assigned after Opti markup is built (in the constructor)
	surface;
	pht;
	txt;
	search;
	searchInput;
	dd;
	list;
	opts;

	// SECTION Constructor

	constructor($s, options) {

		//
		// ANCHOR Settings
		//

		/* If there are no options, create an empty object
		so we can still use it in the extend code below. */
		options = options || {};

		/* If options is a string (as it is when taken from
		an HTML attribute), parse it into an object. */
	 	typeof options == "string" && (options = JSON.parse(options));

		/* Settings can be set here as defaults or at
		instantiation by passing an object of the
		values you wish to set as the second
		argument. Any options set at instantiation
		in this manner will overwrite these
		defaults for the instantiated Opti. */
		this.settings = $.extend(
			{
				
				/* The Opti will be in short mode if it has
				fewer than this number of options. Short
				mode currently just means the search
				input is hidden. (Users can still search
				by typing when focused on the Opti's
				surface and the search input will be shown
				and focused on. It will hide again when
				they close the Opti.) */
				shortModeThreshold : 7,

				/* Removes the Opti's first option and
				injects its text into the surface as
				placeholder text. This will be done if this
				setting is true or if it is a string that
				matches the first option's value.

				This is different from "choosing" the
				option. The value of the Opti is not set.
				In fact, the option is deleted and not
				choosable. It becomes a prompt or label,
				mimicking the placeholder attribute of
				other form elements. If an option is
				chosen through the selected attribute or
				user action, the placeholder text is
				replaced with the text of the chosen option.

				The intention behind this functionality is
				to handle the practice common with selects
				of using the first option not as a choice
				but as placeholder text that functions either
				as a prompt ("Please choose one") or a label
				("Favorite food"). Such options are not meant
				to be chosen and when they are, the select
				is essentially in its zero state. So we might
				as well move such an option out of the list
				of choices and into its own unique
				placeholder feature. */
		    	useFirstOptionAsPlaceholder	: false,

				/* Custom classes to add to the Opti's root
				element. This value is injected directly
				into a call to jQuery's addClass method,
				so it should follow that syntax--a string
				without dots, multiple classes separated
				by spaces. For example, "foo bar" to make
				the element .foo.bar. */
				classes : "",
				
				showClearAll : true,
				
				firstOptDefault : true
				
			},
			options
		);


		//
		// ANCHOR Storage array
		//

		/* If this select is already instantiated as
		an Opti, destroy the old one and
		reinstantiate. The new instance will
		replace the old one in its location in
		the window's optis array.
		Otherwise, push it as a new one onto the
		end of the array. */
		let alreadyInstantiatedIndex = -1;

		$.each(
			window.optis,
			(_i, v) => {
				v && v.s.is($s) && (alreadyInstantiatedIndex = $.inArray(v, window.optis));
			}
		);

		if (alreadyInstantiatedIndex >= 0) {
			window.optis[alreadyInstantiatedIndex].destroy(true);
			window.optis[alreadyInstantiatedIndex] = this;
		} else {
			const firstUndefinedIndex = window.optis.findIndex(element => element === undefined);
			if (firstUndefinedIndex >= 0) {
				window.optis[firstUndefinedIndex] = this;
			} else {
				window.optis.push(this);
			}
		}

		
		//
		// ANCHOR Properties
		//

		/* Store each Opti's index relative to one another
		for unique identifiers such as in event listeners.
		Useful for debugging too. */
		this.i = $(window.optis).index(this);

		/* Store a reference to the original select element
		being replaced. Note: It's not just discarded; a
		relationship is maintained between it and the
		Opti. Changes made via the Opti are stored in the
		original select. This way the source of the form
		data doesn't change when you use Opti.
		Also, if the user changes the select's val or
		properties, Opti tries to reflect the udpates.
		Beware however: select elements don't fire change
		events automatically when their values are changed
		programmatically. If a change event is not triggered,
		Opti won't notice the change and the Opti and select
		could become desynchronized. */
		this.s = $s;

		/* Any labels that reference the original select. */
		this.l = $(`label[for="${this.s.attr("id")}"]`).add(this.s.closest("label"));

		/* We're going to number our optgroups so we have
		unique identifiers to target them with.
		(Specifically when one is removed from the select,
		we need to be able to find the corresponding
		section in the Opti. (We can't simply count its
		index among the optgroups because by the time the
		mutation is observed, the optgroup is already
		detached from the DOM.)) */
		this.groupCount = 1;


		/* Keep a reference to the root class
		for use within closures where the
		meaning of the "this" keyword
		changes. */
		const self = this;


		//
		// ANCHOR Markup construction
		//

		this.o = Opti.#buildAnOpti.bind(this)();

		this.surface = this.o.find(".surface");
		this.pht = this.surface.find(".text-ph");
		this.txt = this.surface.find(".text-op");
		this.taglist = this.surface.find(".text-ul");
		this.search = this.o.find(".search");
		this.searchInput = this.search.find("input");
		this.dd = this.o.find(".dropdown");
		this.list = this.o.find(".list");
		this.opts = this.list.find("span");


		//
		// ANCHOR Placeholder text
		//
		
		/* According to the setting
		useFirstOptionAsPlaceholder, we will
		remove the Opti's first option and
		inject its text into the surface as
		placeholder text intended to function
		as a prompt or label. This will be
		done if that setting is true (not
		just truthy) or if it is a string
		that matches the value of the first
		option.
		
		See the comments on the
		useFirstOptionAsPlaceholder setting
		near the start of this file for
		further explanation of this feature.
		
		Note that this placeholder text will
		be immediately removed via the
		chooseOption method called in the
		section below this one if any
		options are marked to be initially
		chosen with the "selected"
		attribute. */

		/* This property represents whether the
		placeholder feature is enabled for this
		Opti. (Not if the actual placeholder is
		active, just the feature that potentially
		activates it.)*/
		this.ufoap = this.getUFOAP;
		const
			$nonDisabledOpts = this.opts.not("[disabled=disabled]"),
			$firstOpt = $nonDisabledOpts.first()
		;

		if (this.ufoap) {

			/* Store the placeholder text (which is
			the text of the first option). */
			this.placeholderText = $firstOpt.text();

			/* Store the value of the placeholder
			option so we don't get confused if it
			gets chosen in the select element and
			an option with this value doesn't
			exist in the Opti anymore. We'll know
			to restore the zero state. */
			this.placeholderValue = $firstOpt.attr("data-value");

			/* Permanently remove the first option. */
			$firstOpt.remove();


			/* Inject the placeholder text
			into its element. */
			
			this.pht.text(this.placeholderText);

		}

		
		//
		// ANCHOR Initially-selected options
		//
		
		const $initiallySelectedOpts = this.opts.filter("[selected=selected]").not("[disabled=disabled]");

		/* Choose any options set to be initially
		selected with the "selected" attribute.
		These have top priority.
		
		What will end up in the surface of the Opti:
		Priority 1: "selected" options
		Priority 2: placeholder text (based on UFOAP setting)
		Priority 3: first option (based on FOD setting)
		else blank */
		if ($initiallySelectedOpts.length) {
			this.chooseOption($initiallySelectedOpts, false, true, true);
		}
		else {
			if (this.ufoap) {
				/* Show the placeholder and choose
				its original-select option. This
				takes precedence over the defaults
				below. There's a check for ufoap
				in this method so we don't need
				it here. */
				this.#choosePlaceholderOption();
				this.o.addClass("zerostate");
			} else {
				if (this.settings.firstOptDefault && !this.o.is("[multiple]")) {
					const $firstChoosableListItem = this.o.find(".list span:not([disabled=disabled])").first();
					this.chooseOption($firstChoosableListItem, false, true);
				} else {
					self.handleZeroStateText();
				}
			}
		}


		//
		// ANCHOR Insertion
		//

		/* Hide the "real" select and stick
		our Opti into the DOM after it. Also
		make the select's tabindex negative
		to discourage users from getting at it.
		Store the original tabindex in case
		we destroy this Opti later and want
		to return everything to its original
		state. */
		this.s
				.addClass("opti-hidden")
				.data("originalTabindex", this.s.prop("tabindex"))
				.attr("tabindex","-1")
				.after(this.o)
		;


		//
		// ANCHOR Attributes
		//

		/* INDEX
		Just for convenience in identifying the
		Opti's position in the window.optis
		array, stick its index in an attribute. */
		this.o.attr("data-opti-index", this.i);

		/* SHORT MODE
		Set shortmode on the Opti if its option
		count is below the threshold setting.
		Then HIDE the search accordingly.

		We only hide it because we might still
		want it. If a user starts typing with
		the surface of an Opti focused, we
		consider that to be an explicit choice
		to search regardless of this setting,
		and we need to support that choice
		because even default select elements
		support that in a limited way.
		So ditching the search based on this
		option is more of an aesthetic
		suggestion than a hard-and-fast
		functional rule. */
		this.isInShortMode = this.opts.length < this.settings.shortModeThreshold;
		if (this.isInShortMode) this.search.hide();

		/*
		DISABLED
		Make it so the Opti can't be tabbbed
		to if it's disabled.
		*/
		if (this.o.is("[disabled]")) this.surface.attr("tabindex","-1");

		/*
		CLASSES
		*/
		const
			sClasses = this.s.attr("class"),
			classRegex = / ?opti-hidden/i,
			classesToApply = sClasses.replace(classRegex, "")
		;
		this.o.addClass(classesToApply);

		
		//
		// SECTION Event handling
		//
		// TODO Namespace these! Remember to add the
		// namespaces in destroy() as well.
			
		// ANCHOR Window resize - flip dropdown
		/* Possibly flip the dropdown to the top
		on load and window resize. See comments on
		the orientDropdown method for details. */
		
		$(self.#orientDropdown());
		$(window).on(
			"resize",
			() => {
				self.#orientDropdown();
			}
		);

		
		// ANCHOR Label click
		/* Make it so clicking any labels referencing
		the original select puts focus on the Opti's
		surface. */
		
		this.l.length && this.l.on(
			"click",
			e => {
				e.preventDefault();
				const
					inOpti = $(e.target).closest(".opti").length,
					oIsDisabled = self.o.is("[disabled=disabled]")
				;
				if (!oIsDisabled & !inOpti) self.showMenu();
			}
		);


		// ANCHOR Select element emergencies
		/* These are for if the select element manages to
		get focused and/or changed. On focus we move focus
		to the Opti.
		On change... Well, we do all we can to prevent this
		but savvy users can do anything they want on the
		front end. If the user changes it, as long as change
		was triggered on the select, Opti will sync with it.
		*/
		this.s.on({
			
			
			/* If the user manages to focus on the select
			despite its negative tabindex, offscreen
			position, and label element click behavior
			usurping, immediately move focus to the Opti. */

			focus: () => {
				self.surface.trigger("focus");
			},

			/* The user somehow managed to change the value
			of the select external to the Opti.
			Update the Opti to reflect the new value by
			unchoosing all, then choosing the select's
			values. This way, the select and its Opti
			sync value changes both ways. This is
			extremely important to mitigate the chance
			that the Opti and the select will become
			desynchronized, misleading the user. Beware
			however: if the select element is changed
			programatically and the change event is not
			manually triggered, Opti will not notice the
			change. (Selects don't automatically fire
			the change event when updated with JS.) */
			change: (e, ignore) => {
				if (!ignore) {
					/* The select has been changed and not by this plugin.
					Read the new value of the select and choose & unchoose
					Opti options accordingly. (This looks better than just
					nuking everything and then choosing like we used to.) */
					const
						sVal = self.s.val()
					;
					let $liTargetsToUnchoose = $();
					self.opts.each(
						function (i, v) {
							if ($.inArray($(v).attr("data-value"), sVal) === -1) {
								$liTargetsToUnchoose = $liTargetsToUnchoose.add($(v));
							}
						}
					);
					self.unchooseOption($liTargetsToUnchoose, false, false, false, true);
					self.chooseOption(sVal);
				}
			}
			
		});

		// ANCHOR Dropdown activation
		/* If the surface is clicked (or enter'd),
		show/hide the dropdown. */
		this.surface.on(
			"click",
			e => {
				e.preventDefault();
				if (self.o.attr("disabled") != "disabled") {
					self.o.is(".activated") ? self.hideMenu() : self.showMenu();
				}
			}
		);

		// ANCHOR Keys on surface
		this.surface.on({
			
			/* If the user starts typing while the surface
			is focused (as opposed to the search input),
			we still want it to search. This mimics
			native select behavior. They sort of search
			when users type while focused on them.
			
			Because the "keypress" event fires before
			"keydown" does and before the character is
			actually typed, we can use a "keypress"
			listener to set focus on the search input,
			and then the character ends up in it when
			"keydown" then fires.
			
			We want to support searching in this
			manner even if the search input is hidden
			due to short mode. In such cases, showMenu
			temporarily shows the search input. It will
			be hidden again when the dropdown is closed.
			
			Note that keypress only fires for keys that
			produce visible characters, so the user will
			only end up in the search input in those
			cases. I think this is perfect for this
			situation--except for when space is pressed,
			in which case we want it to open the Opti. */
			keypress: e => {
				
				const oIsActivated = self.o.hasClass("activated");
				
				if (!self.o.prop("disabled")) {

					/* SPACE:
					Open menu */
					if (e.which == 32) {
						e.preventDefault();
						oIsActivated ? self.hideMenu(false) : self.showMenu();
					}

					/* Anything else that inserts a character:
					Show menu and always focus on search box */
					else {
						// self.searchInput.trigger("focus");
						self.showMenu(true);
					}

				}

			},
		
			/* Keydown on the surface.
			We also want to capture certain keys with
			a keydown listener. We can't just rely on
			the keypress listener above focusing the
			user on the search input prior to this
			listener firing, because unlike keydown,
			keypress only fires when a key that
			produces a visible character is pressed. */
			keydown: e => {
				const
					oIsActivated = self.o.hasClass("activated"),
					oIsDisabled = self.o.is("[disabled=disabled]"),
					oIsMultiple = self.o.is("[multiple]"),

					$allLIs = self.o.find(".list span"),
					$selectableOpts = $allLIs.not(".opti-hidden,[disabled=disabled]"),
					$removableOpts = $allLIs.filter(".selected"),

					$currentlySelected = $selectableOpts.filter(".selected").first(),
					CSIndex = $selectableOpts.index($currentlySelected),
					$CSPrevAll = $currentlySelected.length ? $selectableOpts.slice(0,CSIndex) : $selectableOpts,
					$CSNextAll = $currentlySelected.length ? $selectableOpts.slice(CSIndex+1) : $selectableOpts,

					$currentlyFocused = $selectableOpts.filter(".fakefocus"),
					CFIndex = $selectableOpts.index($currentlyFocused),
					$CFPrevAll = $currentlyFocused.length ? $selectableOpts.slice(0,CFIndex) : $selectableOpts,
					$CFNextAll = $currentlyFocused.length ? $selectableOpts.slice(CFIndex+1) : $selectableOpts
				;

				switch(e.which) {

					// SPACE
					/* See keypress listener above. */

					// ESC
					/* Close the Opti. */
					case 27:
						e.preventDefault();
						oIsActivated && self.hideMenu();
						break;

					// TAB
					/* If the user has selected an option
					with the arrow keys, choose that
					option upon tab out of the Opti. */
					case 9:
						if ($currentlyFocused.length && !$currentlyFocused.is($currentlySelected) && !oIsDisabled && oIsActivated && !oIsMultiple) {
							self.chooseOption($currentlyFocused);
						}
						self.hideMenu();
						break;

					// ENTER/RETURN
					/* Prevent default so any forms
					we're in don't submit. If the
					Opti is open, and a currently
					un-chosen option is "fake
					focused", choose it. If an
					option is "fake focused" that
					is already chosen, un-choose it
					only if this is a multi-choice
					Opti. If the Opti isn't
					currently open, just open it. */
					case 13:
						e.preventDefault();

						if (!oIsDisabled) {

							if (oIsActivated) {

								// If an option is fake focused...
								// (If none are, we don't care about enter key presses.)
								if ($currentlyFocused.length) {

									// If an option is fake focused...
									// (If none are, we don't care about enter key presses.)
									if ($currentlyFocused.length) self.#selectionAction($currentlyFocused);
									break;

								}

							} else {
								self.showMenu();
							}
						}
						break;

					// BACKSPACE
					/* Unchoose the last chosen option
					in a multiple mode Opti. */
					case 8:
						e.preventDefault();
						if ($removableOpts.length && !oIsDisabled) self.unchooseOption($removableOpts.last());
						break;

					// UP ARROW
					/* If Opti is open, move "fake focus"
					up in the option list. If it is
					closed, choose the previous option
					without opening the dropdown. This
					mimics native select elements'
					behavior. In both cases we loop
					around to the last option if we're
					at the beginning. */
					case 38:
						if (oIsActivated) {
							e.preventDefault();
							let $t = $CFPrevAll.last();

							/* If we're at the top or nothing is currently
							fakefocused, loop around and focus
							on the last option in the list. */
							if (!$CFPrevAll.length || !$currentlyFocused.length) {
								$t = $selectableOpts.last();
							}

							self.#fakeFocusOn($t);

						} else {
							if (!oIsMultiple) {
								e.preventDefault();
								const shouldWeFade = !self.isZeroState;
								const $optionTarget = $CSPrevAll.length ? $CSPrevAll.last() : $selectableOpts.last();
								self.chooseOption($optionTarget, false, shouldWeFade);
							}
						}
						break;

					// DOWN ARROW
					/* If Opti is open, move "fake focus"
					down in the option list. If it is
					closed, choose the next option
					without opening the dropdown. This
					mimics native select elements'
					behavior. In both cases we loop
					around to the first option if we're
					at the end. */
					case 40:
						if (oIsActivated) {
							e.preventDefault();
							let $t = $CFNextAll.first();

							/* If we're at the bot or nothing is currently
							fakefocused, loop around and focus
							on the first option in the list. */
							if (!$CFNextAll.length || !$currentlyFocused.length) {
								$t = $selectableOpts.first();
							}

							self.#fakeFocusOn($t);

						} else {
							if (!oIsMultiple) {
								e.preventDefault();
								const shouldWeFade = !self.isZeroState;
								const $optionTarget = $CSNextAll.length ? $CSNextAll.first() : $selectableOpts.first();
								self.chooseOption($optionTarget, false, shouldWeFade);
							}
						}
						break;

					// HOME
					/* In at least some browsers, the home
					key will scroll to the beginning of
					the document even if you're in a
					text input. If the Opti is open,
					prevent that default behavior and
					instead move fake focus to the first
					focusable option in the list. */
					case 36:
						if (oIsActivated) {
							e.preventDefault();

							const $t = $selectableOpts.first();
							
							// Move fake focus to the first option in the list
							self.#fakeFocusOn($t);
						}
						break;

					// END
					/* In at least some browsers, the end
					key will scroll to the end of
					the document even if you're in a
					text input. If the Opti is open,
					prevent that default behavior and
					instead move fake focus to the last
					focusable option in the list. */
					case 35:
						if (oIsActivated) {
							e.preventDefault();

							const $t = $selectableOpts.last();
							
							// Move fake focus to the first option in the list
							self.#fakeFocusOn($t);
						}
						break;

				}
			}
		});

		// ANCHOR Keys on search input
		this.searchInput.on({
			keydown: e => {
				const
					oIsActivated = self.o.hasClass("activated"),
					oIsDisabled = self.o.is("[disabled=disabled]"),
					oIsMultiple = self.o.is("[multiple]"),
					$allLIs = self.o.find(".list span"),

					searchIsBlank = self.searchInput.val() === "",

					$selectableOpts = $allLIs.not(".opti-hidden,[disabled=disabled]"),
					$removableOpts = $allLIs.filter(".selected"),

					$currentlySelected = $selectableOpts.filter(".selected").first(),
					
					$currentlyFocused = $selectableOpts.filter(".fakefocus"),
					CFIndex = $selectableOpts.index($currentlyFocused),
					$CFPrevAll = $currentlyFocused.length ? $selectableOpts.slice(0,CFIndex) : $selectableOpts,
					$CFNextAll = $currentlyFocused.length ? $selectableOpts.slice(CFIndex+1) : $selectableOpts
				;

				switch(e.which) {

					// TAB
					/* If the user has selected an option
					with the arrow keys or with search,
					choose that option upon tab out of
					the Opti.
					We are primarily making tab
					"choose" rather than "cancel"
					so we can support this use-case:
					Tabbing onto a select, typing to
					both (sort of) search and select
					an option, and tabbing out of the
					select with that option now being
					the chosen one without ever having
					expanded the select or hitting
					enter. Opti will have expanded,
					but the end-result of the same
					pattern of keys will be the same
					this way. This is important since
					we can't expect an end-user to
					know the difference between an
					Opti and a native select (except
					that it's unusually nice!).
					Edit: We're now only doing this
					in single-select Optis. */
					case 9:
						if ($currentlyFocused.length && !$currentlyFocused.is($currentlySelected) && !oIsDisabled && oIsActivated && !oIsMultiple) {
							self.chooseOption($currentlyFocused);
						}
						self.hideMenu();
						break;

					// UP ARROW
					/* Move fake focus up in the option list.
					Normally, the up arrow key in a text
					input moves the cursor to the
					beginning of its contents. I don't
					care about this functionality. */
					case 38:
						e.preventDefault();

						/* If there are any options that aren't
						currently hidden by searching... */
						if ($selectableOpts.length) {

							let $t = $CFPrevAll.last();

							/* If we're at the top or nothing is currently
							fakefocused, loop around and focus
							on the last option in the list. */
							if (!$t.length) $t = $selectableOpts.last();

							self.#fakeFocusOn($t);

						}
						break;

					// DOWN ARROW
					/* Move fake focus down in the option list.
					Normally, the down arrow key in a text
					input moves the cursor to the end of
					its contents. I don't care about this
					functionality. */
					case 40:
						e.preventDefault();

						/* If there are any options that aren't
						currently hidden by searching... */
						if ($selectableOpts.length) {

							let $t = $CFNextAll.first();

							/* If we're at the top or nothing is currently
							fakefocused, loop around and focus
							on the last option in the list. */
							if (!$t.length) $t = $selectableOpts.first();

							self.#fakeFocusOn($t);

						}
						break;

					// HOME
					/* Move fake focus to the first focusable
					option in the list.
					In at least some browsers, the home
					key will scroll to the beginning of
					the document even if you're in a
					text input. We're preventing that
					default behavior. */
					case 36:
						e.preventDefault();

						/* Move fake focus to the first
						option in the list */
						if ($selectableOpts.length) self.#fakeFocusOn($selectableOpts.first());
						break;

					// END
					/* Move fake focus to the last focusable
					option in the list.
					In at least some browsers, the end
					key will scroll to the end of the
					document even if you're in a text
					input. We're preventing that default
					behavior. */
					case 35:
						e.preventDefault();

						/* Move fake focus to the first
						option in the list */
						if ($selectableOpts.length) self.#fakeFocusOn($selectableOpts.last());
						break;

					// ESC
					/* Close the Opti.
					Who knows what esc might do in
					various browsers. We're going out
					on a limb and preventing its
					default behavior. */
					case 27:
						e.preventDefault();
						self.o.hasClass("activated") && self.hideMenu();
						break;

					// BACKSPACE
					/* Unchoose the last chosen option
					in a multiple mode Opti if the
					input is empty. */
					case 8:
						if (searchIsBlank) {
							e.preventDefault();
							if ($removableOpts.length) self.unchooseOption($removableOpts.last());
						}
						break;

					// ENTER/RETURN
					/* Choose (or possibly un-choose in
					the case of a multi-mode Opti)
					the fake-focused option. */
					case 13:
						e.preventDefault();

						/* If an option is fake focused...
						(If none are, we don't care about enter key presses.) */
						if ($currentlyFocused.length) self.#selectionAction($currentlyFocused);
						break;

				}

			},

			/* Search any time the value of the
			search input changes. */
			"input change": () => {
				if (self.searchInput.val()) {
					self.#searchMenu(self.searchInput.val());
				} else {
					self.#unsearchMenu();
				}
			}
		});

		// ANCHOR List item click
		/* Items can also be chosen with the keyboard. See
		the surface and search input keydown listeners -
		the sections for the enter key. */
		this.list.on(
			"click",
			"span",
			e => {
				if ($(e.target).is(":not(span)")) e.target = $(e.target).closest("span").get(0);
				self.#selectionAction($(e.target));
			}
		);

		// ANCHOR Tag click
		/* Clicking on tags removes them and unchooses the
		corresponding option (assuming Opti isn't disabled).
		Event delegation is nice here so we only need one
		event listener no matter how many tags there are.
		Plus tags come and go, so we'd have to add the
		listener every time we make one down in the
		chooseOption method. */
		this.taglist.on(
			"click",
			".tag",
			e => {
				e.preventDefault();
				e.stopPropagation();
				const
					$tag = $(e.target).is(".tag") ? $(e.target) : $(e.target).closest(".tag"),
					nothingsDisabled = !($tag.is("[disabled=disabled]") || self.o.is("[disabled=disabled]"))
				;
				if (nothingsDisabled) self.unchooseOption($tag.attr("data-value"), false, false, self.surface);
			}
		);


		// ANCHOR Clear all button
		/* This button unchooses all options that can be.
		It works in single-select optis as well unless
		the button is hidden with the setting. */
		this.o.find(".surface .icon-ex-surf").on({
			click: e => {
				e.preventDefault();
				e.stopPropagation();

				const
					oIsNotDisabled = self.o.is(":not([disabled=disabled])"),
					$targets = self.o.find(".list .selected").not("[disabled=disabled]")
				;

				/* Unchoose everything and focus on the surface. */
				if (oIsNotDisabled) self.unchooseOption($targets, false, false, self.surface);
			},
			mouseenter: () => {
				this.o.addClass("highlightRemovables");
			},
			mouseleave: () => {
				this.o.removeClass("highlightRemovables");
			}
		});


		// ANCHOR Click on document
		/* Whenever anything is clicked, close all the Optis except the one
		that was clicked within if any were in fact clicked within. */
		$(document).on(
			"click.opti-" + self.i,
			e => {
				const
					clickIsInOpti = $(e.target).closest(self.o).length,
					clickIsInLinkedLabel = $(e.target).closest(`[for=${self.s.attr("id")}]`)
							.add($(e.target).closest("label").has(self.s))
							.length
				;
				if (!clickIsInLinkedLabel && !clickIsInOpti) {
					self.hideMenu(false);
				};
			}
		);

		// !SECTION


		/* SECTION Mutation observer

		These mutations aren't just edge cases. Their
		observation is a primary feature of Opti, as it's
		entirely reasonable to expect that developers will
		make programmatic changes to their selects. They
		shouldn't have to update that code to target Opti
		instead. So this feature is worth the admittedly
		lengthy code.

		We care about the following changes:
		- Addition of options
		- Removal of options
		- Change in options' values
		- Change in options' disabled status
		- Change in select's disabled status
		- Change in select's multiple status

		Not worried about "selected" on options
		because that only affects what's selected
		at page load (I think).
		*/

		const config = { attributes: true, childList: true, subtree: true, attributeOldValue: true };

		const callback = (mutationList) => {
			for (const mutation of mutationList) {
				if (mutation.type == "attributes") {

					//
					// SECTION Select attribute
					//

					if ($(mutation.target).is("select")) {

						// ANCHOR Disabled

						if (mutation.attributeName == "disabled") {
							if (self.s.attr(mutation.attributeName) != mutation.attributeName) {
								self.o.removeAttr(mutation.attributeName);
							} else {
								self.o.attr(mutation.attributeName, self.s.attr(mutation.attributeName));
							}
						}
						
						// ANCHOR Multiple

						if (mutation.attributeName == "multiple") {
							const
								currentVal = self.s.val(),
								targetVal = Array.isArray(currentVal) ? currentVal[0] : currentVal,
								$targetOpt = self.o.find(`.list .list-item[data-value="${targetVal}"]`),
								$nonDisabledOpts = self.o.find(".list .list-item:not([disabled])"),
								callbackArgs = {
									$targetOpt : $targetOpt,
									$nonDisabledOpts : $nonDisabledOpts
								}
							;

							if (self.o.find(".list .list-item.selected").length) {
								/* If there is anything to unchoose,
								delay choosing until we've unchosen */
								self.unchooseOption(self.o.find(".list .list-item.selected"), Opti.#unchooseAfter.bind(self, callbackArgs));
							} else {
								/* If there is nothing to unchoose,
								immediately choose */
								Opti.#unchooseAfter.bind(self, callbackArgs)();
							}
							// self.s.is("[multiple]") ? self.o.attr("multiple", "multiple") : self.o.removeAttr("multiple");
						}

					}
					
					// !SECTION

					// SECTION Option attribute

					else if ($(mutation.target).is("option")) {
						
						// ANCHOR Value

						if (mutation.attributeName == "value") {
							const
								$correspondingListItem = self.o.find(`.list span[data-value="${mutation.oldValue}"]`),
								$correspondingTag = self.o.find(`.surface .tag[data-value="${mutation.oldValue}"]`)
							;
							$correspondingListItem.add($correspondingTag).attr("data-value", $(mutation.target).val());
						}
						
						// ANCHOR Disabled

						else if (mutation.attributeName == "disabled") {
							const
								newVal = $(mutation.target).attr("disabled") || false,
								$correspondingListItem = self.o.find(`.list span[data-value="${$(mutation.target).val()}"]`)
							;
							if (newVal == "disabled") {
								$correspondingListItem.attr("disabled", "disabled");
								if ($correspondingListItem.is(".selected")) {
									self.unchooseOption($correspondingListItem, () => {
										if (self.isBlank && !self.placeholderTextEnabled && self.settings.firstOptDefault) {
											self.chooseOption(self.o.find(".list span:not([disabled=disabled])").first());
										} else {
											self.handleZeroStateText();
										}
									}, false, false, true);
								}
							} else {
								$correspondingListItem.removeAttr("disabled");
							}
						}
					}

					// !SECTION

				// SECTION Node tree modification

				} else if (mutation.type == "childList") {
					
					if (mutation.addedNodes.length) {
						
						// ANCHOR Node insertion
						
						mutation.addedNodes.forEach(
							function (currentValue) {
								const
									$addedNode = $(currentValue),
									$newTree = Opti.#convertOptsAndGroups.bind(self, $addedNode)(),
									addedNodeIsOptgroup = $addedNode.is("optgroup"),
									$addedNodeParent = $addedNode.parent(),
									optAddedToOptgroup = $addedNodeParent.is("optgroup")
								;

								// Optgroup

								if (addedNodeIsOptgroup) {
									$addedNode.add($newTree).attr("data-groupindex", () => self.groupCount);
									self.groupCount++;
									const
										$sValidAll = self.s.children(`option:not([value="${self.placeholderValue}"]), optgroup`),
										$oValidAll = self.list.children(`.list-item, section`),
										ind = $sValidAll.index($addedNode) - 1
									;
									if (ind == -1) {
										$newTree.prependTo(self.list);
									} else {
										const
											$listItemAtInd = $oValidAll.eq(ind)
										;
										$newTree.insertAfter($listItemAtInd)
									}
								} 
								
								// Option
								
								else {
									if ($addedNode.is(":first-child")) {
										if (optAddedToOptgroup) {
											const
												opGrpInd = self.s.find("optgroup").index($addedNodeParent),
												$grp = self.list.children("section").eq(opGrpInd)
											;
											$newTree.insertAfter($grp.children("h5").first());
										} else {
											$newTree.prependTo(self.list);
										}
									} else {
										const
											$sValidOpts = self.s.find(`option:not([value="${self.placeholderValue}"])`),
											$oValidOpts = self.list.find("span"),
											ind = $sValidOpts.index($addedNode) - 1,
											$spanAtInd = $oValidOpts.eq(ind)
										;
										if (ind == -1) {
											$newTree.insertBefore($oValidOpts.first());
										} else {
											if (optAddedToOptgroup) {
												$newTree.insertAfter($spanAtInd);
											} else {
												if ($spanAtInd.next().is("section:not(:has(span))")) {
													$newTree.insertAfter($spanAtInd.nextUntil("span", "section:not(:has(span))").last());
												} else if ($spanAtInd.is("section:not(.list) > :last-child")) {
													$newTree.insertAfter($spanAtInd.parent("section"));
												} else {
													$newTree.insertAfter($spanAtInd);
												}
											}
										}
									}
								}
							}
						);
						/* Recalculate shortmode based on the original setting. */
						self.isInShortMode = self.opts.length < self.settings.shortModeThreshold;
						if (self.isInShortMode) self.search.hide();
					} else if (mutation.removedNodes.length) {

						// ANCHOR Node removal

						mutation.removedNodes.forEach(
							currentValue => {
								const
									removedNodeIsOpt = $(currentValue).is("option"),
									removedNodeIsOptgroup = $(currentValue).is("optgroup"),
									$selectedOptsToUnchoose = $(currentValue).find(":selected").addBack(":selected")
								;
								let $nukeTarget;
								if (removedNodeIsOpt) {
									$nukeTarget = self.o.find(`.list-item[data-value="${$(currentValue).val()}"]`);
								} else if (removedNodeIsOptgroup) {
									const opGrpInd = $(currentValue).attr("data-groupindex");
									$nukeTarget = self.o.find(`.list-group[data-groupindex=${opGrpInd}]`);
								}
								if ($selectedOptsToUnchoose.length) {
									let $listItemTargets = $();
									$selectedOptsToUnchoose.each(
										function (i, v) {
											$listItemTargets = $listItemTargets.add(`span[data-value="${$(v).val()}"]`, self.list);
										}
									);
									self.unchooseOption($listItemTargets, false, true);
								}
								$nukeTarget.remove();
							}
						);
						self.isInShortMode = self.opts.length < self.settings.shortModeThreshold;
						if (!self.isInShortMode) self.search.show();
					}
				}

				// !SECTION

			}
		};

		/* Create an observer instance linked
		to the callback function */
		this.observer = new MutationObserver(callback);

		/* Start observing the target node for
		configured mutations */
		this.observer.observe(this.s.get(0), config);

		// !SECTION


	}

	// !SECTION



	// SECTION Methods
	
	// ANCHOR Getters

	get isPlaceholder() {

		const
			val = this.s.val(),
			phv = this.placeholderValue,
			valIsString = typeof val == "string",
			valIsArray = Array.isArray(val),
			valIsInArray = valIsArray && val.length == 1 && $.inArray(phv, val) >= 0,
			valIsInString = valIsString && phv == val
		;

		return this.getUFOAP && (valIsInArray || valIsInString);

	}




	get isBlank() {

		const
			val = this.s.val(),
			valIsFalseOrNull = val === null || val === false,
			valIsString = typeof val == "string",
			valIsArray = Array.isArray(val),
			stringIsFalsy = valIsString && !val,
			arrayIsFalsy = valIsArray && !val.length
		;

		return valIsFalseOrNull || stringIsFalsy || arrayIsFalsy;

	}




	get isZeroState() {

		return this.isBlank || this.isPlaceholder;

	}




	get getUFOAP() {

		const
			ufoapSetting = this.settings.useFirstOptionAsPlaceholder,
			ufoapSettingType = typeof ufoapSetting,
			$nonDisabledOpts = this.opts.not("[disabled=disabled]"),
			$firstOpt = $nonDisabledOpts.first(),
			firstOptVal = $firstOpt.attr("data-value"),
			ufoapBool = ufoapSetting === true || ufoapSettingType == "string" && firstOptVal === ufoapSetting
		;

		return ufoapBool;

	}



	// ANCHOR Markup construction

	static #buildAnOpti () {

		const
			svgExSurf 	= `<svg class="icon-ex-surf" 	width="20" height="20" viewBox="6.5 6.5 20 20" 	stroke="currentColor" stroke-width="1" 		stroke-linecap="round" stroke-linejoin="round" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20,13 L13,20" fill="none" opacity="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M13,13 L20,20" fill="none" opacity="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
			svgChevs 	= `<svg class="icon-chevs" 		width="16" height="16" viewBox="0 0 24 24" 		stroke="currentColor" stroke-width="1" 		stroke-linecap="round" stroke-linejoin="round" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>`,
			svgBan 		= `<svg class="icon-ban-surf"	width="13" height="13" viewBox="0 0 24 24" 		stroke="currentColor" stroke-width="1.5" 	stroke-linecap="round" stroke-linejoin="round" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>`,
			svgSearch 	= `<svg class="icon-search" 	width="16" height="16" viewBox="0 0 24 24" 		stroke="currentColor" stroke-width="1" 		stroke-linecap="round" stroke-linejoin="round" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 6H3"/><path d="M10 12H3"/><path d="M10 18H3"/><circle cx="17" cy="15" r="3"/><path d="m21 19-1.9-1.9"/></svg>`,
			// TODO Make theme and scheme insertion conditional based on whether they're set
			$oOpti = $(`<div class="opti" data-theme="${this.s.data("theme")}" data-scheme="${this.s.data("scheme")}">`)
					.attr("id", this.s.attr("id") ? `${this.s.attr("id")}-opti` : null)
					.addClass(this.settings.classes)
					.append(
						$(`
							<a href="#" class="surface">
								<div class="texts">
									<span class="text-op"></span>
									<span class="text-ph"></span>
									<ul class="text-ul"></ul>
								</div>
								${svgExSurf}
								${svgChevs}
								${svgBan}
							</a>
							<div class="dropdown">
								<div class="search">
									${svgSearch}
									<input type="text" class="search-input" tabindex="-1" autocomplete="off">
								</div>
								<div class="list"></div>
							</div>
						`)
					)
		;

		/* Reflect element properties */

		this.s.is("[disabled]") && $oOpti.attr("disabled", this.s.attr("disabled"));
		this.s.is("[multiple]") && $oOpti.attr("multiple", this.s.attr("multiple"));
		this.s.is("[tabindex]") && $oOpti.find(".surface").attr("tabindex", this.s.attr("tabindex"));

		this.ogTabindex = this.s.attr("tabindex");

		!this.settings.showClearAll && $oOpti.find(".surface .icon-ex-surf").remove();

		/* Construct option list */

		/* Give each optgroup a unique identifier
		This is mostly so we can identify them
		when they are removed from the select
		(which a mutation obsever watches for). */
		this.s.find("optgroup").attr("data-groupindex", () => this.groupCount++);
		Opti.#convertOptsAndGroups.bind(this, this.s)().appendTo($oOpti.find(".dropdown .list"));

		return $oOpti;

	}




	static #convertOptsAndGroups ($tree) {

		const isSelect = $tree.is("select");

		/* We wrap it in a div becaue jQuery's replaceWith
		method doesn't work if the element has no parent.
		Wrap() returns the original contents, so we then
		need to traverse to the new wrapper. */
		let $newTree = $tree.clone().wrap("<div/>").parent();
		
		/* Select element parent */
		if (isSelect) $newTree.children("select").contents().unwrap();
		
		/* Groups */
		$newTree.find("optgroup").replaceWith(
			function () {
				const
					lab = $(this).attr("label"),
					contents = $(this).html(),
					$newEle = $("<section/>")
							.addClass("list-group")
							.attr("data-groupindex", $(this).attr("data-groupindex"))
							.html(contents)
							.prepend(`<h5>${lab}</h5>`)
				;
				return $newEle;
			}
		);

		/* Options */
		$newTree.find("option").replaceWith(
			function () {
				const
					sel = $(this).attr("selected") || false,
					dis = $(this).attr("disabled") || false,
					val = $(this).val(),
					contents = $(this).html(),
					$newEle = $("<span/>")
							.addClass("list-item")
							.attr("selected", sel)
							.attr("disabled", dis)
							.attr("data-value", val)
							.html(contents)
							.prepend($('<svg xmlns="http://www.w3.org/2000/svg" class="icon-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'))
							.append($('<svg xmlns="http://www.w3.org/2000/svg" class="icon-tick" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'))
							.append($('<svg xmlns="http://www.w3.org/2000/svg" class="icon-ban" width="15" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>'))
				;
				return $newEle;
			}
		);
		
		return $newTree.contents();

	}



	// ANCHOR Menu visibility


	showMenu (focusOnSearch = !this.isInShortMode) {

		if (this.o.is(":not(.activated)")) {

			/* Add the "activated" class to the Opti. This class does
			the heavy lifting in terms of visbility and transitions. */
			this.o.addClass("activated");

			this.o.trigger("optishow");

		}

		const $focusTarget = focusOnSearch ? this.searchInput : this.surface;

		/* Focus on the search input if the corresponding boolean
		argument is true. We might have to show the search
		input first if it was hidden due to short mode being
		enabled. */
		if (focusOnSearch) $(this.search).filter(":hidden").show();

		$focusTarget.trigger("focus");

	}




	hideMenu (focusOnSurface = true) {
		
		if (this.o.is(".activated")) {

			const
				self = this,
				$currentlyFocused = $(".fakefocus", this.o)
			;

			/* Remove the "activated" class from the Opti,
			the text of the search field, and the focus
			effect placed on options selected with the
			arrow keys. When we remove the search field's
			text, we want to manually trigger the change
			event so the Opti re-searches (returning to
			all options being visible). */
			this.o.removeClass("activated");
			$currentlyFocused.removeClass("fakefocus");

			/* In some cases we want to place focus on
			the surface (the always-visible part of
			the Opti) after it closes. */
			focusOnSurface && this.surface.trigger("focus");

			/* If the Opti is in short mode, hide the
			search if needed. It might be visible even
			if the Opti is in short mode because we
			show the search input no matter what if
			the user types while the surface is
			focused. */
			if (this.isInShortMode && this.search.is(":visible")) this.search.hide();

			this.o.trigger("optihide");

			this.o.find(".dropdown").on(
				"transitionend",
				function (e) {
					if (e.originalEvent.propertyName == "left") {
						$(e.target).off("transitionend");
						self.searchInput.val(null).trigger("change");
					}
				}
			);

		}

	};




	#orientDropdown () {

		/* If the bottom of the Opti's dropdown would
		extend beyond the bottom limit of the
		document, and there is room to flip it to
		above the Opti's surface, do so. This is
		so we don't have ugly blank spaces at the
		bottoms of pages from hidden dropdowns.
		But we don't want to flip it if there
		isn't room for it above the surface
		either. You couldn't scroll into negative
		pixels to access it. Better to have a
		blank space at the bottom of the document
		than have part of our dropdown be
		inaccessible in the great northern ether. */
		if (!this.#hasSpaceBelow && this.#hasSpaceAbove) {
			this.o.addClass("flip-v");
		} else {
			this.o.removeClass("flip-v");
		}

	};




	get #hasSpaceBelow () {
		const
			bodyHeight = $("body").height(),
			surfaceOffset = this.surface.offset().top,
			surfaceHeight = this.surface.outerHeight(),
			dropdownHeight = this.dd.outerHeight(),
			bottomEdgeY = surfaceOffset + surfaceHeight + dropdownHeight
		;

		return bottomEdgeY <= bodyHeight;
	}




	get #hasSpaceAbove () {
		return this.surface.offset().top >= this.dd.outerHeight()
	}




	// ANCHOR Searching


	/* Search and filter the list of options based on the
	string argument. This search is not case sensitive.
	* NOTE - :containsis() is not a native jQuery selector
	but is our own case-insensitive version of :contains()
	(defined below). */
	#searchMenu (string) {

		const
			$spans = $(".list span", this.o),
			$sects = this.list.find("section"),
			filterSelector = ":containsis(" + string + ")",
			$matches = $spans.filter(filterSelector)
		;
		
		this.#unsearchMenu();
		$spans.filter(".fakefocus").removeClass("fakefocus");

		/* Hide options that don't match and sections with
		none that match */
		$spans.not($matches)
				.add($sects).not($matches.parents())
				.addClass("opti-hidden")
		;

		/* If focused on the search box, fake focus on the
		first match. This way the user can just type and hit
		tab or enter to choose the first match. This mimics
		the ease with which you can search + choose in a
		native select in which you can just type without
		opening it and the match is automatically chosen. */
		const $focusableSpans = $spans.not(".opti-hidden,[disabled=disabled]");
		if (this.o.find(".search input").is(":focus") && $focusableSpans.length) $focusableSpans.first().addClass("fakefocus");

	};




	/* Reset all existing filtering. */
	#unsearchMenu () {

		this.list.find(".opti-hidden").removeClass("opti-hidden");

	};



	// ANCHOR Option selection

	/*

	"Chooses" an option, which means it...
	...sets the value in the select element.
	...injects a representation of the choice into the
	surface of the Opti.

	Both of these processes are quite different between
	single- and multi-choice selects and Optis:

	A single-choice select element's val expects a string
	when setting its value. A single-choice Opti simply
	displays the text of the chosen option as a text node in
	its surface.

	In multiple mode, selects expect arrays. We're either
	giving it the old array with our new val pushed onto it
	or we're creating a new one if there is no value.

	For flexibility's sake, the vals argument can be several
	types:
	* A STRING that is the VALUE of the option being chosen
	* An ARRAY of such strings
	* A jQuery object of the actual Opti list elements
	The last method is usually used, but it's easier to use
	the string or array of strings if we're updating the
	Opti from the select's val which is of those types.

	*/
	chooseOption (vals, setFocus, noFadeOut = false, noFadeIn = false) {

		/* Keep a reference to the root class
		for use within closures where the
		meaning of the "this" keyword
		changes. */
		const
			self = this,
			wasPlaceholder = this.isPlaceholder
		;

		/* Initialize a jQuery object that will
		contain the elements representing
		the target values. */
		let $options = $();

		/* Determine what was passed to us in the
		vals argument and build a jQuery object
		of the target option elements
		accordingly. */
		if (Array.isArray(vals)) {
			/* An array of values was passed in. */
			$.each(
				vals,
				(ind, currVal) => {
					const $target = self.o.find(`.list [data-value="${currVal}"]`);
					$options = $options.add($target);
				}
			);
		} else if (typeof vals == "string") {
			/* A single value was passed in. */
			const $target = self.o.find(`.list [data-value="${vals}"]`);
			$options = $options.add($target);
		} else if (typeof vals == "object" && vals instanceof jQuery) {
			/* A jQuery object was (probably) passed in. */
			$options = $options.add(vals);
		}

		const $option = $options.first();

		if ($options.length) {

			/* Why WAS blank? We use it later after that has
			changed (based on the val of the select which is
			set right below this), but still need to know
			what state we came from to know whether and what
			to fade. */
			const wasBlank = this.isBlank;

			// This method has a check for whether it's
			// currently placeholder, so we don't need one
			// here.
			Opti.#unchoosePlaceholderOption.bind(self)();

			// Multiple-select Optis - Set value in select

			if (this.s.is("[multiple]")) {

				$options.each(
					(_i, v) => {

						/* Add the value of the chosen option
						to the original select.
						
						We store chosen values in the
						original select so that devs don't
						have to update their forms when
						integrating Opti with it. The form
						submission data will still come
						from the select element. Opti is
						really just an interface for that
						native element. */
						self.s.val(
							(_i2, v2) => {
								v2.push($(v).attr("data-value"));
								return v2;
							}
						);
					}
				);
			}
			
			// Single-select Optis - Set value in select

			else {
				
				self.s.val($option.attr("data-value"));
				
				/* Move the class that highlights the
				current choice in the list of options
				to our newly chosen one. */
				this.o.find(".list span.selected").removeClass("selected");
				$option.addClass("selected");

				/* In the case of single-choice Optis,
				we assume the user is done after they
				have made a choice and therefore close
				the Opti for them. */
				this.hideMenu(setFocus);

			}

			const
				fadeOutCallbackArgs = {
					$options : $options,
					setFocus : setFocus,
					wasPlaceholder : wasPlaceholder,
					noFadeIn : noFadeIn
				}
			;

			if (wasBlank || noFadeOut || this.o.is("[multiple]")) {

				/* No fade out. Immediately call the method that
				otherwise goes into unchoose's callback.
				Either we're... 
				* Coming from blank (so there is nothing to fade
				out)
				* Deliberately supressing the fadeout via an arg
				* In multiple mode in which case choosing an
				option doesn't unchoose anything so we don't 
				need to fade out. */

				Opti.#chooseAfter.bind(this)(fadeOutCallbackArgs);

			} else {

				/* We're fading something out:
				Placeholder if we were on it, otherwise the
				option text because we are going from one
				choice to another. */

				const $fadeOutTarget = wasPlaceholder && !noFadeOut ? this.pht : this.txt;

				this.#fadeOut.bind(this)($fadeOutTarget, Opti.#chooseAfter.bind(this, fadeOutCallbackArgs), false);

			}
			
		}
	}




	static #chooseAfter (args) {

		
		const
			self = this,
			$option = args.$options.first()
		;

		this.o.removeClass("zerostate");

		args.$options.each(
			(i, v) => {

				const alreadyChosen = $(v).is(".selected");

				if (!alreadyChosen) {

					/* Create and inject a visible
					representation of the new
					choice into the surface.
					Add click handling to these new
					elements that removes them and
					un-chooses their corresponding
					options again. */
					let $newTag = $("<li/>")
							.addClass("tag")
							.attr("data-value", $(v).attr("data-value"))
							.append('<svg class="icon-ex" height="7px" width="7px" stroke-miterlimit="10" style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" version="1.1" viewBox="0 0 7 7" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" stroke="currentColor" stroke-width="1"><path d="M6.5 0.5L0.5 6.5" fill="none" opacity="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M0.5 0.5L6.5 6.5" fill="none" opacity="1" stroke-linecap="round" stroke-linejoin="round"/></svg>')
							.append($('<span/>').addClass("tag-text").text($(v).text()))
					;

					let valPosition = $.inArray($(v).attr("data-value"), self.s.val());
					if (args.wasPlaceholder) valPosition = 0;
					const isAtBeginning = valPosition == 0;

					if (isAtBeginning) {
						$newTag.prependTo(self.o.find(".surface ul"));
					} else {
						const $targTag = self.o.find(".surface .tag").eq(valPosition - 1);
						$newTag.insertAfter($targTag);
					}

					if (!args.noFadeIn) {

						/* NOTE - .pre-initial sets the tag
						to its visible state with no trans
						so that it can be measured.
						We briefly overlap that class and
						.initial to prevent the tag from
						transitioning out when we remove
						.pre-initial, which we do next. */

						$newTag.addClass("pre-initial");
						const
							actualWidth = $newTag.outerWidth(),
							actualHeight = $newTag.outerHeight()
						;
						$newTag.addClass("initial");
						$newTag.removeClass("pre-initial");

						$newTag.outerHeight();

						/* NOTE - The measurements we took
						above are for essentially being able
						to transition to auto width and
						height. It needs a fixed measurement
						to transition to, so we use its own
						width that we got above. */

						$newTag.css(
							{
								width: actualWidth,
								height: actualHeight,
								opacity: 1
							}
						);

						$newTag.outerHeight();

						/* Once the transition has ended we
						will no longer need the inline
						styles. */

						$newTag.on(
							"transitionend",
							function (e) {
								if (e.originalEvent.propertyName == "opacity") {
									$newTag.removeAttr("style");
								}
							}
						);

						/* Removing the initial class starts
						the transition toward on state. */

						$newTag.removeClass("initial");
					}

				}

			}
		);

		// Multiple-select Optis

		if (self.o.is("[multiple]")) {

			/* Highlight the newly selected options in the
			list to show they are chosen. */
			args.$options.addClass("selected");

			/* Clear the search box and trigger change event
			so it unsearches. */
			self.o.find(".search input").val(null).trigger("change");

			if (args.setFocus) {
				const $focusTarget = self.isInShortMode && self.search.is(":hidden") ? self.surface : self.searchInput;
				$focusTarget.trigger("focus");
			}

		}

		// Single-select Opti

		else {

			/* Set the text of the Opti's surface to be the
			same as the chosen option's. */
			self.o.find(".surface .text-op").text($option.text());

			/* Add the optgroup's label before the option
			text if applicable. */
			const $optParent = $option.parent();
			if ($optParent.is("section:not(.list)")) {
				const grpLabel = $optParent.find("h5").first().text();
				self.txt.prepend(`<span class="text-grp">${grpLabel}</span>`);
			}

		}

		/* Fire a change event on the select as this doesn't
		happen automatically upon programmatic change of a
		form input's value.
		The extra parameter for .trigger() tells Opti to
		ignore this change. (Normally Opti watches and 
		matches changes to its select which would create an
		infinite loop here.) */
		self.s.add(self.o).trigger("change", true);
		
	}




	/* 
	
	"Un-chooses" an option, which means it...
	* ... sets the value of the select element.
	* ... removes the surface tag that represents the chosen
	option.

	For flexibility's sake, the vals argument can be several
	types:
	* The VALUE of the option being unchosen as a STRING
	* An ARRAY of such strings
	* A jQuery object of the actual Opti list elements
	We usually use the last method, but it's easier to use
	the string or array of strings if we're updating the
	Opti from the select's val which is of those types.
	
	Arguments:
	* vals: See above
	* callback: A function to execute after the elements
	have faded out (sometimes we then immediately choose an
	option)
	* callbackArgs: Object - Some info the above callback
	might need
	* focusTarget: jQuery object, false - What to focus on
	after unchoosing (usually the surface or nothing)
	* dontUpdateSelect: Bool - Don't change the vals in the
	select element, just do so in the Opti. This is mostly
	for when the select element's val is changed
	independently from the Opti. In that case the Opti is
	matching the select rather than the other way around.
	* noFade: Bool - Whether to fade out or just remove
	immediately.
	
	*/
	unchooseOption (vals, callback, callbackArgs, focusTarget, dontUpdateSelect, noFade = false) {

		const
			
			/* Keep a reference to the root class for use
			within closures where the meaning of the "this"
			keyword changes. */
			self = this,

			oIsMulti = this.o.is("[multiple]"),
			sIsMulti = this.s.is("[multiple]")
		;
		
		/* Determine what was passed to us in the vals
		argument and build a jQuery object of the target
		option elements accordingly. */
		let $options = $();
		if (Array.isArray(vals)) {
			/* An array of values was passed in. */
			$.each(
				vals,
				(_ind, currVal) => {
					const $target = $("[data-value='" + currVal + "']", this.list);
					$options = $options.add($target);
				}
			);
		} else if (typeof vals == "string") {
			/* A single value was passed in. */
			$options = this.opts.filter(`[data-value="${vals}"]`);
		} else if (typeof vals == "object" && vals instanceof jQuery) {
			/* A jQuery object was (probably) passed in. */
			$options = $options.add(vals);
		}
		if (!dontUpdateSelect) $options = $options.filter(".selected");

		/* Remove the selected class from the un-chosen
		options. */
		$options.removeClass("selected");
		
		if (!dontUpdateSelect) {

			if (sIsMulti) {
				/* Splice the values out of the select. */
				self.s.val(
					(i, v) => {
						let newVal = v;
						$options.each(
							(i2, v2) => {
								newVal.splice($.inArray($(v2).attr("data-value"), v), 1);
							}
						);
						return newVal;
					}
				);
			} else {
				/* Single-select Opti--just nuke the val. */
				self.s.val("");
			}

			/* Fire a change event on the select as
			this doesn't happen automatically upon
			programmatic change of a form input's
			value.
			We use an event namespace so we can
			differentiate between Opti-induced
			changes and changes that happen
			external to Opti. When a change occurs
			to the select external to Opti, the
			Opti will try to stay synchronized. */
			this.s.trigger("change", true);
		
		}

		/* The surface tags that represent
		the unchosen options. */
		let $targetTags = $();
		$options.each(
			(i, v) => {
				$targetTags = $targetTags.add($(`.surface ul .tag[data-value="${$(v).attr("data-value")}"]`, self.o));
			}
		);

		if (noFade || (!$targetTags.length && oIsMulti)) {
			
			$targetTags.remove();
			if (typeof callback === "function") {
				callback(self, callbackArgs);
			}
			self.handleZeroStateText();
			
		} else if (oIsMulti && $targetTags.length) {

			Opti.#fadeOutTag.bind(self, $targetTags, callback)();

		} else {

			self.#fadeOut.bind(self, self.surface.find(".text-op"), callback, false)();

		}

		/* Let's fire a change event on the Opti too
		so it feels like a real boy. */
		this.o.trigger("change");

		/* If the search box has content entered,
		clear it. */
		this.searchInput.val() && this.searchInput.val("").trigger("change");

		/* If focustarget is defined and is a jQuery
		object, focus on that object's element. */
		if (focusTarget instanceof jQuery) {
			focusTarget.trigger("focus");
		}

	};




	/* Sometimes used as the callback of unchoose() - 
	Mostly in the mutation observer in the constructor. */

	static #unchooseAfter (args) {

		const self = this;


		// This is for when we're unchoosing because we just observed a mutation
		// to the multiple attribute. We need to wait until now to reflect that
		// change.
		if (self.s.is("[multiple]")) {
			self.o.attr("multiple", "multiple");
		} else {
			self.o.removeAttr("multiple");
		}

		if (args.$targetOpt.length) {
			self.chooseOption(args.$targetOpt, false, true);
		} else {
			if (self.isBlank && !self.placeholderTextEnabled && self.settings.firstOptDefault && args.$nonDisabledOpts.length) {
				/* If we're now blank, choose the first opt
				if that option is enabled. */
				self.chooseOption(args.$nonDisabledOpts.first(), false);
			} else {
				/* If that option isn't enabled, we're just
				staying blank. */
				self.handleZeroStateText();
			}
		}
	}




	// Figure out what to do when an option is clicked on or
	// chosen with keyboard.

	#selectionAction ($t) {

		/* If the target argument isn't a span, it's probably
		because a click event target was passed in and it's
		a child element of the span we want (like an svg),
		so find the closest span ancestor in that case. */
		if ($t.is(":not(span)")) $t = $t.closest("span");

		const
			anythingIsDisabled = this.o.add($t).is("[disabled=disabled]"),
			optIsSelected = $t.is(".selected"),
			oIsMultiple = this.o.is("[multiple]")
		;
		
		if (!anythingIsDisabled) {

			/* If the clicked option is already selected... */
			if (optIsSelected) {
				/* If this is a multiple-select Opti,
				unselect the option. */
				if (oIsMultiple) {
					const $focusTarget = this.isInShortMode ? this.o.find(".surface") : this.o.find(".search input");
					this.unchooseOption($t, $focusTarget);
				}
				/* (We're not un-choosing when single-select.
				Instead just close the menu and let the user
				think they chose the option that was already
				chosen.) */
				else this.hideMenu();
			}

			/* If the clicked option is not selected, select
			it no matter what kind of Opti this is. */
			else this.chooseOption($t, true);

		}

	}




	/* If ufoap, set the select's val to the previously
	stored placeholder value. This is slightly different
	between multi- and single-select Optis. */

	#choosePlaceholderOption () {

		if (this.getUFOAP) {

			if (this.o.is("[multiple]")) this.s.val([this.placeholderValue]);
			else this.s.val(this.placeholderValue);

		}

	};




	static #unchoosePlaceholderOption () {

		if (this.isPlaceholder) {
			if (Array.isArray(this.s.val())) {
				const needle = this.placeholderValue;
				this.s.val(
					(i, v) => {
						return Array.isArray(v) ? v.toSpliced($.inArray(needle, v), 1) : false;
					}
				);
			} else if (typeof this.s.val() == "string") {
				this.s.val("foo");
			}
		}

	};




	handleZeroStateText () {
		if (this.isZeroState) {
			this.o.addClass("zerostate");
			if (this.getUFOAP) {
				this.#choosePlaceholderOption.bind(this)();
			} else {
				this.o.find(".surface .text-op").text(null);
			}
		} else {
			this.o.removeClass("zerostate");
		}
	}



	// ANCHOR Helpers
	
	
	#fadeOut ($t, callback, removeTarget) {

		const self = this;


		/* Force redraw of the transitioning element.
		Otherwise browsers try to be too clever
		and ruin our transitions. */
		window.getComputedStyle($t.get(0)).top;

		/* Remove any placeholder text that
		might be present and the class that
		styles it so that the user can
		differentiate between it and an
		actual choice. These are for before
		an option has been chosen, and we're
		now choosing one.
		
		See comments on the
		useFirstOptionAsPlaceholder
		setting near the top of this file
		for more details regarding the
		placeholder text feature. */
		$t.css(
			{
				/* width: function () { return "min-content" },
				"flex-basis": function () { return $(this).outerWidth() }, */
				opacity: 1,
				transform: "translate(0px, 0px)"
			}
		);

		/* Force redraw of the transitioning element.
		Otherwise browsers try to be too clever
		and ruin our transitions. */
		window.getComputedStyle($t.get(0)).top;

		$t.addClass("fadingOut");

		/* Force redraw of the transitioning element.
		Otherwise browsers try to be too clever
		and ruin our transitions. */
		window.getComputedStyle($t.get(0)).top;

		$t.on(
			"transitionend",
			function (e) {

				/* Force redraw of the transitioning element.
				Otherwise browsers try to be too clever
				and ruin our transitions. */
				window.getComputedStyle($t.get(0)).top;

				if (e.originalEvent.propertyName == "opacity") {

					/* Force redraw of the transitioning element.
					Otherwise browsers try to be too clever
					and ruin our transitions. */
					window.getComputedStyle($t.get(0)).top;

					if (removeTarget) {
						$t.remove();
					} else {
						$t.removeClass("fadingOut");
						$t.removeAttr("style");
					}
					self.handleZeroStateText();
					if (typeof callback === "function") {
						callback();
					}
					$t.off("transitionend");

				}
			}
		);
	}




	static #fadeOutTag ($t, callback) {

		const self = this;

		/* Remove any placeholder text that
		might be present and the class that
		styles it so that the user can
		differentiate between it and an
		actual choice. These are for before
		an option has been chosen, and we're
		now choosing one.
		
		See comments on the
		useFirstOptionAsPlaceholder
		setting near the top of this file
		for more details regarding the
		placeholder text feature. */
		$t.css(
			{
				width: function () { return $(this).outerWidth() },
				// "flex-basis": function () { return $(this).outerWidth() },
				height: function () { return $(this).outerHeight() },
				opacity: 1,
				transform: "translate(0px, 0px)"
			}
		);

		/* Force redraw of the transitioning element.
		Otherwise browsers try to be too clever
		and ruin our transitions. */
		window.getComputedStyle($t.get(0)).top;

		$t.addClass("fadingOut");

		/* Force redraw of the transitioning element.
		Otherwise browsers try to be too clever
		and ruin our transitions. */
		window.getComputedStyle($t.get(0)).top;

		$t.on(
			"transitionend",
			function (e) {
				if (e.originalEvent.propertyName == "opacity") {
					$t.remove();
					self.handleZeroStateText();
					if (typeof callback === "function") {
						callback();
					}
				}
			}
		);
	}



	// ANCHOR List item stuff

	#fakeFocusOn ($t) {

		if ($t.length) {
			this.o.find(".list .fakefocus").removeClass("fakefocus");
			$t.addClass("fakefocus");
			this.#scrollOptionIntoView($t);
		}

	};




	/* Sadly our "fake focus" doesn't move the
	scrollbar to keep it visible as tabbing
	does, so we must scroll the list
	manually to keep our home-baked highlight
	in view.

	.scrollIntoView() isn't good  enough.
	It's too aggressive, scrolling the list
	so the option is at the top even if no
	scrolling was necessary. There is a
	.scrollIntoViewIfNeeded(), but at this time
	it is still a proprietary method with
	inadequate adoption. */
	#scrollOptionIntoView ($option) {

		/*
		.position() returns the offset
		relative to the offset parent.
		The offset parent in these cases
		is the list. 
		*/
		const
			$oList = this.o.find(".list"),
			$prevH5 = $option.prev("h5"),
			$topTarget = $prevH5.length ? $prevH5 : $option,
			offsetTop = $topTarget.position().top,
			offsetBot = $option.position().top + $option.outerHeight(),
			isAboveFold = offsetTop < 0,
			isBelowFold = offsetBot > $oList.innerHeight()
		;

		if (isAboveFold) {
			$oList.scrollTop($oList.scrollTop() + offsetTop);
		} else if (isBelowFold) {
			$oList.scrollTop($oList.scrollTop() + offsetBot - $oList.innerHeight());
		}

	};




	// ANCHOR Destruction
	/* Undo whatever we did:
	- Remove Opti element
	- Un-hide the select
	- Restore select's original tabindex
	- Remove event handling on:
	  - Select
	  - Label
	  - Document
	- Disconnect select's mutation observer
	- Remove instance from window array */
	destroy (preserveSlotInWindowArray) {

		preserveSlotInWindowArray = preserveSlotInWindowArray || false;
		this.s.add(this.l).off("focus.opti change click.opti");
		this.o.remove();
		this.s.removeClass("opti-hidden")
				.attr("tabindex", this.s.data("originalTabindex"))
		;
		$(document).off(`click.opti-${this.i}`);
		this.observer.disconnect();
		preserveSlotInWindowArray ? window.optis[this.i] = undefined : window.optis.splice(this.i, 1);

	};



};


// !SECTION






/* This adds a case-insensitive version of
jQuery's :contains selector, which
selects elements that contain text
nodes containing the text entered as
the argument. This is for Opti's search. */
jQuery.expr[':'].containsis = function(a, i, m) {
	return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};



//
// Instantiation
//

/* Plugin for ease of instantiation.
Priority is on options passed in
argument followed by those in HTML
attribute. */
$.fn.opti = function (options) {

    return this.filter("select").each(
    	function() {

			const
				attrSetts = $(this).data("opti-options"),
				attrSettsAsJSON = attrSetts && typeof attrSetts == "string" ? JSON.parse(attrSetts) : attrSetts,
				extendedSetts = $.extend(attrSettsAsJSON, options)
			;

			new Opti($(this), extendedSetts);

		}
	);

};


/* Auto-instantiation based on HTML
attributes */
$(
	function () {
		$("[data-opti]").each(
			function () {
				$(this).opti();
			}
		);		
	}
);