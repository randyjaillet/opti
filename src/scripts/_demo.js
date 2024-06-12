$( document ).ready(function() {

	// Instantiation

	$("#demo").opti(
		{
			useFirstOptionAsPlaceholder : true
		}
	);

	$('#theme-switch, #scheme-switch, [id^="control-"]').opti(
		{
			showClearAll : false
		}
	);
	
	
	const $demo = $("#demo");
	let $demoOpti = $demo.next(".opti");


	// Theme switcher nonsense

	$demoOpti.attr("data-theme", $("#theme-switch").val());
	$("#theme-switch").on(
		"change.opti",
		e => {
			$demoOpti = $demo.next(".opti");
			$demoOpti.attr("data-theme", $(e.target).val());
		}
	);


	// Scheme switcher nonsense

	$("body > main > header").addClass("opti-scheme-" + $("#scheme-switch").val());
	$demoOpti.add("#theme-switch-opti, #scheme-switch-opti").attr("data-scheme", $("#scheme-switch").val());
	$("#scheme-switch").on(
		"change.opti",
		e => {
			$demoOpti = $demo.next(".opti");
			$demoOpti.add("#theme-switch-opti, #scheme-switch-opti").attr("data-scheme", $(e.target).val());
			$("body > main > header").attr(
				"class",
				(i, attrVal) => {
					var regex = /\bopti-scheme-\S+\b/g;
					return attrVal.replace(regex, "");
				}
			).addClass("opti-scheme-" + $(e.target).val());
		}
	);
	
	
	// Mutation sandbox

	const
		addOption = () => {
			countOpt++;
			return $(`<option value="i${countOpt}">Option ${countOpt} (inserted)</option>`);
		},

		addOptgroup = () => {
			return $(`<optgroup label="Group ${window.optis[0].groupCount} (inserted)"/>`);
		}
	;
	let countOpt = $demo.find("option").length + 1;
	let countGrp = $demo.find("optgroup").length + 1;

	$("#doit1").on(
		"click",
		e => {
			
			e.preventDefault();

			const
				whichAction = $("#control-append").val(),
				whichTarget = $("#control-append-what").val(),
				phEnabled = window.optis[0].placeholderTextEnabled,
				$firstOpt = $demo.find(`option:not([value="${window.optis[0].placeholderValue}"])`).first(),
				$firstOptgroup = $demo.find("optgroup").first(),
				$lastOpt = $demo.find(`option:not([value="${window.optis[0].placeholderValue}"])`).last(),
				$lastOptgroup = $demo.find("optgroup").last(),
				$lastNonEmptyOptgroup = $demo.find("optgroup:has(option)").last(),
				$lastOptgroupFirstOpt = $lastNonEmptyOptgroup.find("option").first(),
				$lastOptgroupLastOpt = $lastNonEmptyOptgroup.find("option").last()
			;

			switch(whichAction) {

				case "append":

					switch (whichTarget) {

						case "opt":
							$demo.append(addOption());
							break;

						case "optgroup":
							$demo.append(addOptgroup());
							break;

						case "optgroupOpt":
							$lastOptgroup.append(addOption());
							break;

					}

					break;

				case "prepend":

					switch (whichTarget) {

						case "opt":
							addOption().insertBefore($firstOpt);
							break;

						case "optgroup":
							$demo.prepend(addOptgroup());
							break;

						case "optgroupOpt":
							$lastOptgroup.prepend(addOption());
							break;

					}

					break;
					
				case "rmvLast":

					switch (whichTarget) {

						case "opt":
							$lastOpt.remove();
							break;

						case "optgroup":
							$lastOptgroup.remove();
							break;

						case "optgroupOpt":
							$lastOptgroupLastOpt.remove();
							break;

					}

					break;
				
				case "rmvFirst":

					switch (whichTarget) {

						case "opt":
							$firstOpt.remove();
							break;

						case "optgroup":
							$firstOptgroup.remove();
							break;

						case "optgroupOpt":
							$lastOptgroupFirstOpt.remove();
							break;

					}

					break;
					
			}
		}
	);

	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	$("#insertoptrandomly").on(
		"click",
		e => {
			e.preventDefault();
			const
				$allContents = $demo.find("optgroup, option"),
				randomLocation = getRandomInt($allContents.length)
			;
			if (randomLocation === 0) {
				addOption().prependTo($demo);
			} else {
				addOption().insertAfter($demo.find("optgroup, option").eq(randomLocation));
			}
		}
	);

	$("#togglemultiselect").on(
		"click",
		e => {
			const demoIsMulti = $demo.attr("multiple") == "multiple";
			e.preventDefault();
			$(e.target).toggleClass("on");
			demoIsMulti ? $demo.removeAttr("multiple") : $demo.attr("multiple", "multiple");
		}
	);

	$("#toggledisabselect").on(
		"click",
		e => {
			const demoIsDisab = $demo.attr("disabled") == "disabled";
			e.preventDefault();
			$(e.target).toggleClass("on");
			demoIsDisab ? $demo.removeAttr("disabled") : $demo.attr("disabled", "disabled");
		}
	);

	$("#toggledisabopt").on(
		"click",
		e => {
			const
				$secondOpt = $demo.find("option").eq(2),
				optIsDisab = $secondOpt.attr("disabled") == "disabled"
			;
			e.preventDefault();
			$(e.target).toggleClass("on");
			optIsDisab ? $secondOpt.removeAttr("disabled") : $secondOpt.attr("disabled", "disabled");
		}
	);

	$("#destroy").on(
		"click",
		e => {
			e.preventDefault();
			window.optis[0].destroy(true);
		}
	);

	$("#reinst").on(
		"click",
		e => {
			e.preventDefault();
			$("#demo").opti(
				{
					useFirstOptionAsPlaceholder : true
				}
			);
			$demoOpti = $demo.next(".opti");
			$demoOpti.attr("data-theme", $("#theme-switch").val());
			$demoOpti.attr("data-scheme", $("#scheme-switch").val());
		}
	);
	
	
	$("#activatedlocked").on(
		"click",
		e => {
			e.preventDefault();
			$("#demo-opti").toggleClass("activatedLocked");
			$(e.target).toggleClass("on");
		}
	);

});