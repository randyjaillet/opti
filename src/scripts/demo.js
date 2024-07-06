// ANCHOR Instantiation

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


// ANCHOR Theme switcher nonsense

$demoOpti.attr("data-theme", $("#theme-switch").val());
$("#theme-switch").on(
	"change.opti",
	e => {
		$demoOpti = $demo.next(".opti");
		$demoOpti.attr("data-theme", $(e.target).val());
	}
);


// ANCHOR Scheme switcher nonsense

localStorage.getItem("opti-scheme") == "light" ? $("#scheme-switch-tick").prop("checked", false) : $("#scheme-switch-tick").prop("checked", true);
let scheme = $("#scheme-switch-tick").is(":checked") ? "dark" : "light";

$("body").addClass(`opti-scheme-${scheme}`);
$("body > #frame > header").find(".opti").attr("data-scheme", scheme);
$("#scheme-switch-tick").on(
	"change",
	() => {
		$demoOpti = $demo.next(".opti");
		scheme = $("#scheme-switch-tick").is(":checked") ? "dark" : "light";
		localStorage.setItem("opti-scheme", scheme);
		$("body > #frame > header").find(".opti").attr("data-scheme", scheme);
		$("body").removeClass((index, className) => (className.match (/(^|\s)opti-scheme-\S+/g) || []).join(' ')).addClass("opti-scheme-" + scheme);
	}
);


// ANCHOR Mutation sandbox

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

$("#doit1").on(
	"click",
	e => {
		
		e.preventDefault();

		const
			whichAction = $("#control-append").val(),
			whichTarget = $("#control-append-what").val(),
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
						$demo.append(addOptgroup().append(addOption()));
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
						$demo.prepend(addOptgroup().append(addOption()));
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
		const demoIsMulti = $demo.is("[multiple]");
		e.preventDefault();
		$(e.target).toggleClass("on");
		demoIsMulti ? $demo.removeAttr("multiple") : $demo.prop("multiple", true);
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

// ANCHOR Other controls

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
		$demoOpti.attr("data-scheme", $("#scheme-switch-tick").is(":checked") ? "dark" : "light");
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