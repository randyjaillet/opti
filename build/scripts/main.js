"use strict";function _classPrivateMethodInitSpec(obj,privateSet){_checkPrivateRedeclaration(obj,privateSet),privateSet.add(obj)}function _checkPrivateRedeclaration(obj,privateCollection){if(privateCollection.has(obj))throw new TypeError("Cannot initialize the same private elements twice on an object")}function _defineProperty(obj,key,value){return(key=_toPropertyKey(key))in obj?Object.defineProperty(obj,key,{value:value,enumerable:!0,configurable:!0,writable:!0}):obj[key]=value,obj}function _toPropertyKey(t){var i=_toPrimitive(t,"string");return"symbol"==typeof i?i:i+""}function _toPrimitive(t,r){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(t)}function _assertClassBrand(e,t,n){if("function"==typeof e?e===t:e.has(t))return arguments.length<3?t:n;throw new TypeError("Private element is not present on this object")}window.optis=[];var _Opti_brand=new WeakSet;class Opti{constructor(_$s,options){_classPrivateMethodInitSpec(this,_Opti_brand),_defineProperty(this,"settings",void 0),_defineProperty(this,"i",void 0),_defineProperty(this,"s",void 0),_defineProperty(this,"l",void 0),_defineProperty(this,"o",void 0),_defineProperty(this,"groupCount",void 0),_defineProperty(this,"ogTabindex",void 0),_defineProperty(this,"ufoap",void 0),_defineProperty(this,"surface",void 0),_defineProperty(this,"pht",void 0),_defineProperty(this,"txt",void 0),_defineProperty(this,"search",void 0),_defineProperty(this,"searchInput",void 0),_defineProperty(this,"list",void 0),_defineProperty(this,"opts",void 0),"string"==typeof(options=options||{})&&(options=JSON.parse(options)),this.settings=$.extend({shortModeThreshold:7,useFirstOptionAsPlaceholder:!1,classes:"",showClearAll:!0,firstOptDefault:!0},options);let alreadyInstantiatedIndex=-1;if($.each(window.optis,((i,v)=>{v&&v.s.is(_$s)&&(alreadyInstantiatedIndex=$.inArray(v,window.optis))})),alreadyInstantiatedIndex>=0)window.optis[alreadyInstantiatedIndex].destroy(!0),window.optis[alreadyInstantiatedIndex]=this;else{const firstUndefinedIndex=window.optis.findIndex((element=>void 0===element));firstUndefinedIndex>=0?window.optis[firstUndefinedIndex]=this:window.optis.push(this)}this.i=$(window.optis).index(this),this.s=_$s,this.l=$('label[for="'.concat(this.s.attr("id"),'"]')).add(this.s.closest("label")),this.groupCount=1;const _self=this;this.o=_buildAnOpti.bind(this)(),this.surface=this.o.find(".surface"),this.pht=this.surface.find(".text-ph"),this.txt=this.surface.find(".text-op"),this.search=this.o.find(".search"),this.searchInput=this.search.find("input"),this.list=this.o.find(".list"),this.opts=this.list.find("span"),this.ufoap=this.getUFOAP;const $firstOpt=this.opts.not("[disabled=disabled]").first();this.ufoap&&(this.placeholderText=$firstOpt.text(),this.placeholderValue=$firstOpt.attr("data-value"),$firstOpt.remove(),this.pht.text(this.placeholderText));const $initiallySelectedOpts=this.opts.filter("[selected=selected]").not("[disabled=disabled]");if($initiallySelectedOpts.length)this.chooseOption($initiallySelectedOpts,!1,!0);else if(this.ufoap)_assertClassBrand(_Opti_brand,this,_choosePlaceholderOption).call(this),this.o.addClass("zerostate");else if(this.settings.firstOptDefault&&!this.o.prop("multiple")){const $firstChoosableListItem=this.o.find(".list span:not([disabled=disabled])").first();this.chooseOption($firstChoosableListItem,!1,!0)}else _self.handleZeroStateText();this.s.addClass("opti-hidden").data("originalTabindex",this.s.prop("tabindex")).attr("tabindex","-1").after(this.o),this.o.attr("data-opti-index",this.i),this.isInShortMode=this.opts.length<this.settings.shortModeThreshold,this.isInShortMode&&this.search.hide(),this.o.prop("disabled")&&this.surface.attr("tabindex","-1"),$(_assertClassBrand(_Opti_brand,_self,_orientDropdown).call(_self)),$(window).on("resize",(()=>{_assertClassBrand(_Opti_brand,_self,_orientDropdown).call(_self)})),this.l.length&&this.l.on("click",(e=>{e.preventDefault();const inOpti=$(e.target).closest(".opti").length;!_self.o.is("[disabled=disabled]")&!inOpti&&_self.showMenu()})),this.s.on({focus:()=>{_self.surface.trigger("focus")},change:(e,ignore)=>{if(!ignore){const sVal=_self.s.val();let $liTargetsToUnchoose=$();_self.opts.each((function(i,v){-1===$.inArray($(v).attr("data-value"),sVal)&&($liTargetsToUnchoose=$liTargetsToUnchoose.add($(v)))})),_self.unchooseOption($liTargetsToUnchoose,!1,!1,!1,!0),_self.chooseOption(sVal)}}}),this.surface.on("click",(e=>{e.preventDefault(),_self.o.prop("disabled")||(_self.o.is(".activated")?_self.hideMenu():_self.showMenu())})),this.o.on({focusin:()=>{_self.o.addClass("focus-in")},focusout:()=>{_self.o.removeClass("focus-in")}}),this.surface.on({keypress:e=>{const oIsActivated=_self.o.hasClass("activated");_self.o.prop("disabled")||(32==e.which?(e.preventDefault(),oIsActivated?_self.hideMenu(!1):_self.showMenu()):(_self.searchInput.val(null).trigger("change"),_self.showMenu(!0)))},keydown:e=>{const oIsActivated=_self.o.hasClass("activated"),oIsDisabled=_self.o.is("[disabled=disabled]"),oIsMultiple=_self.o.is("[multiple=multiple]"),$allLIs=_self.o.find(".list span"),$selectableOpts=$allLIs.not(".opti-hidden,[disabled=disabled]"),$removableOpts=$allLIs.filter(".selected"),$currentlySelected=$selectableOpts.filter(".selected").first(),CSIndex=$selectableOpts.index($currentlySelected),$CSPrevAll=$currentlySelected.length?$selectableOpts.slice(0,CSIndex):$selectableOpts,$CSNextAll=$currentlySelected.length?$selectableOpts.slice(CSIndex+1):$selectableOpts,$currentlyFocused=$selectableOpts.filter(".fakefocus"),CFIndex=$selectableOpts.index($currentlyFocused),$CFPrevAll=$currentlyFocused.length?$selectableOpts.slice(0,CFIndex):$selectableOpts,$CFNextAll=$currentlyFocused.length?$selectableOpts.slice(CFIndex+1):$selectableOpts;switch(e.which){case 27:e.preventDefault(),oIsActivated&&_self.hideMenu();break;case 9:!$currentlyFocused.length||$currentlyFocused.is($currentlySelected)||oIsDisabled||!oIsActivated||oIsMultiple||_self.chooseOption($currentlyFocused),_self.hideMenu();break;case 13:if(e.preventDefault(),!oIsDisabled)if(oIsActivated){if($currentlyFocused.length){$currentlyFocused.length&&_assertClassBrand(_Opti_brand,_self,_selectionAction).call(_self,$currentlyFocused);break}}else _self.showMenu();break;case 8:e.preventDefault(),$removableOpts.length&&!oIsDisabled&&_self.unchooseOption($removableOpts.last());break;case 38:if(oIsActivated){e.preventDefault();let $t=$CFPrevAll.last();$CFPrevAll.length&&$currentlyFocused.length||($t=$selectableOpts.last()),_assertClassBrand(_Opti_brand,_self,_fakeFocusOn).call(_self,$t)}else if(!oIsMultiple){e.preventDefault();const shouldWeFade=!_self.isZeroState,$optionTarget=$CSPrevAll.length?$CSPrevAll.last():$selectableOpts.last();_self.chooseOption($optionTarget,!1,shouldWeFade)}break;case 40:if(oIsActivated){e.preventDefault();let $t=$CFNextAll.first();$CFNextAll.length&&$currentlyFocused.length||($t=$selectableOpts.first()),_assertClassBrand(_Opti_brand,_self,_fakeFocusOn).call(_self,$t)}else if(!oIsMultiple){e.preventDefault();const shouldWeFade=!_self.isZeroState,$optionTarget=$CSNextAll.length?$CSNextAll.first():$selectableOpts.first();_self.chooseOption($optionTarget,!1,shouldWeFade)}break;case 36:if(oIsActivated){e.preventDefault();const $t=$selectableOpts.first();_assertClassBrand(_Opti_brand,_self,_fakeFocusOn).call(_self,$t)}break;case 35:if(oIsActivated){e.preventDefault();const $t=$selectableOpts.last();_assertClassBrand(_Opti_brand,_self,_fakeFocusOn).call(_self,$t)}}}}),this.searchInput.on({keydown:e=>{const oIsActivated=_self.o.hasClass("activated"),oIsDisabled=_self.o.is("[disabled=disabled]"),oIsMultiple=_self.o.is("[multiple=multiple]"),$allLIs=_self.o.find(".list span"),searchIsBlank=""===_self.searchInput.val(),$selectableOpts=$allLIs.not(".opti-hidden,[disabled=disabled]"),$removableOpts=$allLIs.filter(".selected"),$currentlySelected=$selectableOpts.filter(".selected").first(),$currentlyFocused=$selectableOpts.filter(".fakefocus"),CFIndex=$selectableOpts.index($currentlyFocused),$CFPrevAll=$currentlyFocused.length?$selectableOpts.slice(0,CFIndex):$selectableOpts,$CFNextAll=$currentlyFocused.length?$selectableOpts.slice(CFIndex+1):$selectableOpts;switch(e.which){case 9:!$currentlyFocused.length||$currentlyFocused.is($currentlySelected)||oIsDisabled||!oIsActivated||oIsMultiple||_self.chooseOption($currentlyFocused),_self.hideMenu();break;case 38:if(e.preventDefault(),$selectableOpts.length){let $t=$CFPrevAll.last();$t.length||($t=$selectableOpts.last()),_assertClassBrand(_Opti_brand,_self,_fakeFocusOn).call(_self,$t)}break;case 40:if(e.preventDefault(),$selectableOpts.length){let $t=$CFNextAll.first();$t.length||($t=$selectableOpts.first()),_assertClassBrand(_Opti_brand,_self,_fakeFocusOn).call(_self,$t)}break;case 36:e.preventDefault(),$selectableOpts.length&&_assertClassBrand(_Opti_brand,_self,_fakeFocusOn).call(_self,$selectableOpts.first());break;case 35:e.preventDefault(),$selectableOpts.length&&_assertClassBrand(_Opti_brand,_self,_fakeFocusOn).call(_self,$selectableOpts.last());break;case 27:e.preventDefault(),_self.o.hasClass("activated")&&_self.hideMenu();break;case 8:searchIsBlank&&(e.preventDefault(),$removableOpts.length&&_self.unchooseOption($removableOpts.last()));break;case 13:e.preventDefault(),$currentlyFocused.length&&_assertClassBrand(_Opti_brand,_self,_selectionAction).call(_self,$currentlyFocused)}},"input change":()=>{_self.searchInput.val()?_assertClassBrand(_Opti_brand,_self,_searchMenu).call(_self,_self.searchInput.val()):_assertClassBrand(_Opti_brand,_self,_unsearchMenu).call(_self)}}),this.list.on("click","span",(e=>{$(e.target).is(":not(span)")&&(e.target=$(e.target).closest("span").get(0)),_assertClassBrand(_Opti_brand,_self,_selectionAction).call(_self,$(e.target))})),this.o.find(".surface .texts ul").on("click",".tag",(e=>{e.preventDefault(),e.stopPropagation();const $tag=$(e.target).is(".tag")?$(e.target):$(e.target).closest(".tag");!($tag.is("[disabled=disabled]")||_self.o.is("[disabled=disabled]"))&&_self.unchooseOption($tag.attr("data-value"),!1,!1,_self.surface)})),this.o.find(".surface .icon-ex-surf").on({click:e=>{e.preventDefault(),e.stopPropagation();const oIsNotDisabled=_self.o.is(":not([disabled=disabled])"),$targets=_self.o.find(".list .selected").not("[disabled=disabled]");oIsNotDisabled&&_self.unchooseOption($targets,!1,!1,_self.surface)},mouseenter:()=>{this.o.addClass("highlightRemovables")},mouseleave:()=>{this.o.removeClass("highlightRemovables")}}),$(document).on("click.opti-"+_self.i,(e=>{const clickIsInOpti=$(e.target).closest(_self.o).length;$(e.target).closest("[for=".concat(_self.s.attr("id"),"]")).add($(e.target).closest("label").has(_self.s)).length||clickIsInOpti||_self.hideMenu(!1)}));this.observer=new MutationObserver((mutationList=>{for(const mutation of mutationList)if("attributes"==mutation.type){if($(mutation.target).is("select")){if("disabled"==mutation.attributeName&&(_self.s.attr(mutation.attributeName)!=mutation.attributeName?_self.o.removeAttr(mutation.attributeName):_self.o.attr(mutation.attributeName,_self.s.attr(mutation.attributeName))),"multiple"==mutation.attributeName){const currentVal=_self.s.val(),targetVal=Array.isArray(currentVal)?currentVal[0]:currentVal,callbackArgs={$targetOpt:_self.o.find('.list span[data-value="'.concat(targetVal,'"]')),$nonDisabledOpts:_self.o.find(".list span:not([disabled=disabled])")};_self.o.find(".list span.selected").length?_self.unchooseOption(_self.o.find(".list span.selected"),_unchooseAfter.bind(_self,callbackArgs)):_unchooseAfter.bind(_self,callbackArgs)()}}else if($(mutation.target).is("option"))if("value"==mutation.attributeName){const $correspondingListItem=_self.o.find('.list span[data-value="'.concat(mutation.oldValue,'"]')),$correspondingTag=_self.o.find('.surface .tag[data-value="'.concat(mutation.oldValue,'"]'));$correspondingListItem.add($correspondingTag).attr("data-value",$(mutation.target).val())}else if("disabled"==mutation.attributeName){const newVal=$(mutation.target).attr("disabled")||!1,$correspondingListItem=_self.o.find('.list span[data-value="'.concat($(mutation.target).val(),'"]'));"disabled"==newVal?($correspondingListItem.attr("disabled","disabled"),$correspondingListItem.is(".selected")&&_self.unchooseOption($correspondingListItem,(()=>{_self.isBlank&&!_self.placeholderTextEnabled&&_self.settings.firstOptDefault?_self.chooseOption(_self.o.find(".list span:not([disabled=disabled])").first()):_self.handleZeroStateText()}),!1,!1,!0)):$correspondingListItem.removeAttr("disabled")}}else"childList"==mutation.type&&(mutation.addedNodes.length?(mutation.addedNodes.forEach((function(currentValue){const $addedNode=$(currentValue),$newTree=_convertOptsAndGroups.bind(_self,$addedNode)(),addedNodeIsOptgroup=$addedNode.is("optgroup"),$addedNodeParent=$addedNode.parent(),optAddedToOptgroup=$addedNodeParent.is("optgroup");if(addedNodeIsOptgroup){$addedNode.attr("data-groupindex",(()=>_self.groupCount++));const $sValidAll=_self.s.children('option:not([value="'.concat(_self.placeholderValue,'"]), optgroup')),$oValidAll=_self.list.children("span, section"),ind=$sValidAll.index($addedNode)-1;if(-1==ind)$newTree.prependTo(_self.list);else{const $listItemAtInd=$oValidAll.eq(ind);$newTree.insertAfter($listItemAtInd)}}else if($addedNode.is(":first-child"))if(optAddedToOptgroup){const opGrpInd=_self.s.find("optgroup").index($addedNodeParent),$grp=_self.list.children("section").eq(opGrpInd);$newTree.insertAfter($grp.children("h5").first())}else $newTree.prependTo(_self.list);else{const $sValidOpts=_self.s.find('option:not([value="'.concat(_self.placeholderValue,'"])')),$oValidOpts=_self.list.find("span"),ind=$sValidOpts.index($addedNode)-1,$spanAtInd=$oValidOpts.eq(ind);-1==ind?$newTree.insertBefore($oValidOpts.first()):optAddedToOptgroup?$newTree.insertAfter($spanAtInd):$spanAtInd.next().is("section:not(:has(span))")?$newTree.insertAfter($spanAtInd.nextUntil("span","section:not(:has(span))").last()):$spanAtInd.is("section:not(.list) > :last-child")?$newTree.insertAfter($spanAtInd.parent("section")):$newTree.insertAfter($spanAtInd)}})),_self.isInShortMode=_self.opts.length<_self.settings.shortModeThreshold,_self.isInShortMode&&_self.search.hide()):mutation.removedNodes.length&&(mutation.removedNodes.forEach((currentValue=>{const removedNodeIsOpt=$(currentValue).is("option"),removedNodeIsOptgroup=$(currentValue).is("optgroup"),$selectedOptsToUnchoose=$(currentValue).find(":selected").addBack(":selected");let $nukeTarget;if(removedNodeIsOpt)$nukeTarget=_self.o.find('.list [data-value="'.concat($(currentValue).val(),'"]'));else if(removedNodeIsOptgroup){const opGrpInd=$(currentValue).attr("data-groupindex");$nukeTarget=_self.o.find(".list section[data-groupindex=".concat(opGrpInd,"]"))}if($selectedOptsToUnchoose.length){let $listItemTargets=$();$selectedOptsToUnchoose.each((function(i,v){$listItemTargets=$listItemTargets.add('span[data-value="'.concat($(v).val(),'"]'),_self.list)})),_self.unchooseOption($listItemTargets,!1,!0)}$nukeTarget.remove()})),_self.isInShortMode=_self.opts.length<_self.settings.shortModeThreshold,_self.isInShortMode||_self.search.show()))})),this.observer.observe(this.s.get(0),{attributes:!0,childList:!0,subtree:!0,attributeOldValue:!0})}get isPlaceholder(){const val=this.s.val(),phv=this.placeholderValue,valIsString="string"==typeof val,valIsInArray=Array.isArray(val)&&1==val.length&&$.inArray(phv,val)>=0,valIsInString=valIsString&&phv==val;return this.getUFOAP&&(valIsInArray||valIsInString)}get isBlank(){const val=this.s.val(),valIsFalseOrNull=null===val||!1===val,stringIsFalsy="string"==typeof val&&!val,arrayIsFalsy=Array.isArray(val)&&!val.length;return valIsFalseOrNull||stringIsFalsy||arrayIsFalsy}get isZeroState(){return this.isBlank||this.isPlaceholder}get getUFOAP(){const ufoapSetting=this.settings.useFirstOptionAsPlaceholder,ufoapSettingType=typeof ufoapSetting,firstOptVal=this.opts.not("[disabled=disabled]").first().attr("data-value");return!0===ufoapSetting||"string"==ufoapSettingType&&firstOptVal===ufoapSetting}showMenu(){let focusOnSearch=arguments.length>0&&void 0!==arguments[0]?arguments[0]:!this.isInShortMode;if(this.o.is(":not(.activated)")){const $focusTarget=focusOnSearch?this.searchInput:this.surface;this.o.addClass("activated"),focusOnSearch&&$(this.search).filter(":hidden").show(),$focusTarget.trigger("focus"),this.o.trigger("optishow")}}hideMenu(){let focusOnSurface=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];if(this.o.is(".activated")){const self=this,$currentlyFocused=$(".fakefocus",this.o);this.o.removeClass("activated"),$currentlyFocused.removeClass("fakefocus"),focusOnSurface&&this.surface.trigger("focus"),this.isInShortMode&&this.search.is(":visible")&&this.search.hide(),this.o.trigger("optihide"),this.o.find(".dropdown").on("transitionend",(function(e){"left"==e.originalEvent.propertyName&&($(e.target).off("transitionend"),self.searchInput.val(null).trigger("change"))}))}}chooseOption(vals,setFocus){let noFade=arguments.length>2&&void 0!==arguments[2]&&arguments[2];const self=this,$txt=this.o.find(".surface .texts .text-op"),wasPlaceholder=this.isPlaceholder;let $options=$();if(Array.isArray(vals))$.each(vals,((ind,currVal)=>{const $target=self.o.find('.list [data-value="'.concat(currVal,'"]'));$options=$options.add($target)}));else if("string"==typeof vals){const $target=self.o.find('.list [data-value="'.concat(vals,'"]'));$options=$options.add($target)}else"object"==typeof vals&&vals instanceof jQuery&&($options=$options.add(vals));const $option=$options.first();if($options.length){_unchoosePlaceholderOption.bind(self)();const wasBlank=this.isBlank;this.s.is("[multiple=multiple]")?$options.each(((i,v)=>{self.s.val(((i2,v2)=>(v2.push($(v).attr("data-value")),v2)))})):(self.s.val($option.attr("data-value")),this.o.find(".list span.selected").removeClass("selected"),$option.addClass("selected"),this.hideMenu(setFocus));const fadeOutCallbackArgs={$options:$options,setFocus:setFocus,wasPlaceholder:wasPlaceholder};wasPlaceholder&&!noFade?_assertClassBrand(_Opti_brand,self,_fadeOut).bind(self)(self.pht,_chooseAfter.bind(self,fadeOutCallbackArgs,!0),!1):wasBlank||noFade||self.o.is("[multiple=multiple]")?_chooseAfter.bind(self)(fadeOutCallbackArgs,!0):_assertClassBrand(_Opti_brand,self,_fadeOut).bind(self)($txt,_chooseAfter.bind(self,fadeOutCallbackArgs),!1)}}unchooseOption(vals,callback,callbackArgs,focusTarget,dontUpdateSelect){let noFade=arguments.length>5&&void 0!==arguments[5]&&arguments[5];const self=this,oIsMulti=this.o.is("[multiple=multiple]"),sIsMulti=this.s.is("[multiple=multiple]");let $options=$();Array.isArray(vals)?$.each(vals,((_ind,currVal)=>{const $target=$("[data-value='"+currVal+"']",this.list);$options=$options.add($target)})):"string"==typeof vals?$options=this.opts.filter('[data-value="'.concat(vals,'"]')):"object"==typeof vals&&vals instanceof jQuery&&($options=$options.add(vals)),dontUpdateSelect||($options=$options.filter(".selected")),$options.removeClass("selected"),dontUpdateSelect||(sIsMulti?self.s.val(((i,v)=>{let newVal=v;return $options.each(((i2,v2)=>{newVal.splice($.inArray($(v2).attr("data-value"),v),1)})),newVal})):self.s.val(""),this.s.trigger("change",!0));let $targetTags=$();$options.each(((i,v)=>{$targetTags=$targetTags.add($('.surface ul .tag[data-value="'.concat($(v).attr("data-value"),'"]'),self.o))})),noFade||!$targetTags.length&&oIsMulti?($targetTags.remove(),"function"==typeof callback&&callback(self,callbackArgs),self.handleZeroStateText()):oIsMulti&&$targetTags.length?_fadeOutTag.bind(self,$targetTags,callback,!0,callbackArgs)():_assertClassBrand(_Opti_brand,self,_fadeOut).bind(self,self.surface.find(".text-op"),callback,!1)(),this.o.trigger("change"),this.searchInput.val()&&this.searchInput.val("").trigger("change"),focusTarget instanceof jQuery&&focusTarget.trigger("focus")}handleZeroStateText(){this.isZeroState?(this.o.addClass("zerostate"),this.getUFOAP?_assertClassBrand(_Opti_brand,this,_choosePlaceholderOption).bind(this)():this.o.find(".surface .text-op").text(null)):this.o.removeClass("zerostate")}destroy(preserveSlotInWindowArray){preserveSlotInWindowArray=preserveSlotInWindowArray||!1,this.s.add(this.l).off("focus.opti change click.opti"),this.o.remove(),this.s.removeClass("opti-hidden").attr("tabindex",this.s.data("originalTabindex")),$(document).off("click.opti-".concat(this.i)),this.observer.disconnect(),preserveSlotInWindowArray?window.optis[this.i]=void 0:window.optis.splice(this.i,1)}}function _buildAnOpti(){const $oOpti=$('<div class="opti" data-theme="'.concat(this.s.data("theme"),'" data-scheme="').concat(this.s.data("scheme"),'">')).attr("id",this.s.attr("id")?"".concat(this.s.attr("id"),"-opti"):null).addClass(this.settings.classes).append($('\n\t\t\t\t\t\t\t<a href="#" class="surface">\n\t\t\t\t\t\t\t\t<div class="texts">\n\t\t\t\t\t\t\t\t\t<span class="text-op"></span>\n\t\t\t\t\t\t\t\t\t<span class="text-ph"></span>\n\t\t\t\t\t\t\t\t\t<ul></ul>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t'.concat('<svg class="icon-ex-surf" \twidth="20" height="20" viewBox="6.5 6.5 20 20" \tstroke="currentColor" stroke-width="1" \t\tstroke-linecap="round" stroke-linejoin="round" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20,13 L13,20" fill="none" opacity="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M13,13 L20,20" fill="none" opacity="1" stroke-linecap="round" stroke-linejoin="round"/></svg>',"\n\t\t\t\t\t\t\t\t").concat('<svg class="icon-chevs" \t\twidth="16" height="16" viewBox="0 0 24 24" \t\tstroke="currentColor" stroke-width="1" \t\tstroke-linecap="round" stroke-linejoin="round" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>',"\n\t\t\t\t\t\t\t\t").concat('<svg class="icon-ban" \t\twidth="13" height="13" viewBox="0 0 24 24" \t\tstroke="currentColor" stroke-width="1.5" \tstroke-linecap="round" stroke-linejoin="round" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>','\n\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t<div class="dropdown">\n\t\t\t\t\t\t\t\t<div class="search">\n\t\t\t\t\t\t\t\t\t').concat('<svg class="icon-search" \twidth="16" height="16" viewBox="0 0 24 24" \t\tstroke="currentColor" stroke-width="1" \t\tstroke-linecap="round" stroke-linejoin="round" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 6H3"/><path d="M10 12H3"/><path d="M10 18H3"/><circle cx="17" cy="15" r="3"/><path d="m21 19-1.9-1.9"/></svg>','\n\t\t\t\t\t\t\t\t\t<input type="text" tabindex="-1" autocomplete="off">\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class="list"></div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t')));return this.s.is("[disabled]")&&$oOpti.attr("disabled",this.s.attr("disabled")),this.s.is("[multiple]")&&$oOpti.attr("multiple",this.s.attr("multiple")),this.s.is("[tabindex]")&&$oOpti.find(".surface").attr("tabindex",this.s.attr("tabindex")),this.ogTabindex=this.s.attr("tabindex"),!this.settings.showClearAll&&$oOpti.find(".surface .icon-ex-surf").remove(),this.s.find("optgroup").attr("data-groupindex",(()=>this.groupCount++)),_convertOptsAndGroups.bind(this,this.s)().appendTo($oOpti.find(".dropdown .list")),$oOpti}function _orientDropdown(){const $s=$(".surface",this.o),$dd=$(".dropdown",this.o);$s.offset().top+$s.outerHeight()+$dd.outerHeight()>$("body").height()&&$s.offset().top>$dd.outerHeight()?this.o.addClass("flip-v"):this.o.removeClass("flip-v")}function _searchMenu(string){const $spans=$(".list span",this.o),filterSelector=":containsis("+string+")",$matches=$spans.filter(filterSelector);_assertClassBrand(_Opti_brand,this,_unsearchMenu).call(this),$spans.filter(".fakefocus").removeClass("fakefocus"),$spans.not($matches).add($(".list section",this.o).not($matches.parents())).addClass("opti-hidden");const $focusableSpans=$spans.not(".opti-hidden,[disabled=disabled]");this.o.find(".search input").is(":focus")&&$focusableSpans.length&&$focusableSpans.first().addClass("fakefocus")}function _unsearchMenu(){this.list.find(".opti-hidden").removeClass("opti-hidden")}function _chooseAfter(args,removeZeroState){const self=this,$option=args.$options.first();if(removeZeroState&&self.o.removeClass("zerostate"),args.$options.each(((i,v)=>{if(!$(v).is(".selected")){let $newTag=$("<li/>").addClass("tag initial").attr("data-value",$(v).attr("data-value")).append('<svg class="icon-ex" height="7px" width="7px" stroke-miterlimit="10" style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" version="1.1" viewBox="0 0 7 7" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" stroke="#000000" stroke-width="1"><path d="M6.5 0.5L0.5 6.5" fill="none" opacity="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M0.5 0.5L6.5 6.5" fill="none" opacity="1" stroke-linecap="round" stroke-linejoin="round"/></svg>').append($("<span/>").addClass("tag-text").text($(v).text())),valPosition=$.inArray($(v).attr("data-value"),self.s.val());args.wasPlaceholder&&(valPosition=0);if(0==valPosition)$newTag.prependTo(self.o.find(".surface ul"));else{const $targTag=self.o.find(".surface .tag").eq(valPosition-1);$newTag.insertAfter($targTag)}$newTag.outerHeight(),$newTag.removeClass("initial")}})),self.o.is("[multiple=multiple]")){if(args.$options.addClass("selected"),self.o.find(".search input").val(null).trigger("change"),args.setFocus){(self.isInShortMode&&self.search.is(":hidden")?self.surface:self.searchInput).trigger("focus")}}else{const $optParent=$option.parent();self.o.find(".surface .text-op").text($option.text()),$optParent.is("section:not(.list)")&&self.o.find(".surface .text-op").prepend('<span class="text-grp">'.concat($optParent.find("h5").text(),"</span>"))}self.s.add(self.o).trigger("change",!0)}function _unchooseAfter(args){const self=this;"multiple"!=self.s.attr("multiple")?self.o.removeAttr("multiple"):self.o.attr("multiple","multiple"),args.$targetOpt.length?self.chooseOption(args.$targetOpt,!1,!0):self.isBlank&&!self.placeholderTextEnabled&&self.settings.firstOptDefault&&args.$nonDisabledOpts.length?self.chooseOption(args.$nonDisabledOpts.first(),!1):self.handleZeroStateText()}function _choosePlaceholderOption(){this.getUFOAP&&(this.o.is("[multiple=multiple]")?this.s.val([this.placeholderValue]):this.s.val(this.placeholderValue))}function _unchoosePlaceholderOption(){if(this.isPlaceholder)if(Array.isArray(this.s.val())){const needle=this.placeholderValue;this.s.val(((i,v)=>!!Array.isArray(v)&&v.toSpliced($.inArray(needle,v),1)))}else"string"==typeof this.s.val()&&this.s.val("foo")}function _fadeOut($t,callback,removeTarget){const self=this;window.getComputedStyle($t.get(0)).top,$t.css({opacity:1,transform:"translate(0px, 0px)"}),window.getComputedStyle($t.get(0)).top,$t.addClass("fadingOut"),window.getComputedStyle($t.get(0)).top,$t.on("transitionend",(function(e){window.getComputedStyle($t.get(0)).top,"opacity"==e.originalEvent.propertyName&&(window.getComputedStyle($t.get(0)).top,removeTarget?$t.remove():($t.removeClass("fadingOut"),$t.removeAttr("style")),self.handleZeroStateText(),"function"==typeof callback&&callback(),$t.off("transitionend"))}))}function _fadeOutTag($t,callback){const self=this;$t.css({width:function(){return $(this).outerWidth()},"flex-basis":function(){return $(this).outerWidth()},opacity:1,transform:"translate(0px, 0px)"}),window.getComputedStyle($t.get(0)).top,$t.addClass("fadingOut"),window.getComputedStyle($t.get(0)).top,$t.on("transitionend",(function(e){"opacity"==e.originalEvent.propertyName&&($t.remove(),self.handleZeroStateText(),"function"==typeof callback&&callback())}))}function _fakeFocusOn($t){$t.length&&(this.o.find(".list .fakefocus").removeClass("fakefocus"),$t.addClass("fakefocus"),_assertClassBrand(_Opti_brand,this,_scrollOptionIntoView).call(this,$t))}function _scrollOptionIntoView($option){const $oList=this.o.find(".list"),$prevH5=$option.prev("h5"),offsetTop=($prevH5.length?$prevH5:$option).position().top,offsetBot=$option.position().top+$option.outerHeight(),isAboveFold=offsetTop<0,isBelowFold=offsetBot>$oList.innerHeight();isAboveFold?$oList.scrollTop($oList.scrollTop()+offsetTop):isBelowFold&&$oList.scrollTop($oList.scrollTop()+offsetBot-$oList.innerHeight())}function _convertOptsAndGroups($tree){const isSelect=$tree.is("select");let $newTree=$tree.clone().wrap("<div/>").parent();return isSelect&&$newTree.children("select").contents().unwrap(),$newTree.find("optgroup").replaceWith((function(){const lab=$(this).attr("label"),contents=$(this).html();return $("<section/>").attr("data-groupindex",$(this).attr("data-groupindex")).html(contents).prepend("<h5>".concat(lab,"</h5>"))})),$newTree.find("option").replaceWith((function(){const sel=$(this).attr("selected")||!1,dis=$(this).attr("disabled")||!1,val=$(this).val(),contents=$(this).html();return $("<span/>").attr("selected",sel).attr("disabled",dis).attr("data-value",val).html(contents).prepend($('<svg xmlns="http://www.w3.org/2000/svg" class="icon-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>')).append($('<svg xmlns="http://www.w3.org/2000/svg" class="icon-tick" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>')).append($('<svg xmlns="http://www.w3.org/2000/svg" class="icon-ban" width="15" height="12" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>'))})),$newTree.contents()}function _selectionAction($t){$t.is(":not(span)")&&($t=$t.closest("span"));const anythingIsDisabled=this.o.add($t).is("[disabled=disabled]"),optIsSelected=$t.is(".selected"),oIsMultiple=this.o.is("[multiple=multiple]");if(!anythingIsDisabled)if(optIsSelected)if(oIsMultiple){const $focusTarget=this.isInShortMode?this.o.find(".surface"):this.o.find(".search input");this.unchooseOption($t,$focusTarget)}else this.hideMenu();else this.chooseOption($t,!0)}jQuery.expr[":"].containsis=function(a,i,m){return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase())>=0},$.fn.opti=function(options){return this.filter("select").each((function(){const attrSetts=$(this).data("opti-options"),attrSettsAsJSON=attrSetts&&"string"==typeof attrSetts?JSON.parse(attrSetts):attrSetts;$.extend(options,attrSettsAsJSON),new Opti($(this),options)}))},$((function(){$("[data-opti]").each((function(){$(this).opti()}))})),$("#demo").opti({useFirstOptionAsPlaceholder:!0}),$('#theme-switch, #scheme-switch, [id^="control-"]').opti({showClearAll:!1});const $demo=$("#demo");let $demoOpti=$demo.next(".opti");$demoOpti.attr("data-theme",$("#theme-switch").val()),$("#theme-switch").on("change.opti",(e=>{$demoOpti=$demo.next(".opti"),$demoOpti.attr("data-theme",$(e.target).val())})),"light"==localStorage.getItem("opti-scheme")?$("#scheme-switch-tick").prop("checked",!1):$("#scheme-switch-tick").prop("checked",!0);let scheme=$("#scheme-switch-tick").is(":checked")?"dark":"light";$("body").addClass("opti-scheme-".concat(scheme)),$("body > main > header").find(".opti").attr("data-scheme",scheme),$("#scheme-switch-tick").on("change",(()=>{$demoOpti=$demo.next(".opti"),scheme=$("#scheme-switch-tick").is(":checked")?"dark":"light",localStorage.setItem("opti-scheme",scheme),$("body > main > header").find(".opti").attr("data-scheme",scheme),$("body").removeClass(((index,className)=>(className.match(/(^|\s)opti-scheme-\S+/g)||[]).join(" "))).addClass("opti-scheme-"+scheme)}));const addOption=()=>(countOpt++,
$('<option value="i'.concat(countOpt,'">Option ').concat(countOpt," (inserted)</option>"))),addOptgroup=()=>$('<optgroup label="Group '.concat(window.optis[0].groupCount,' (inserted)"/>'));let countOpt=$demo.find("option").length+1;function getRandomInt(max){return Math.floor(Math.random()*max)}$("#doit1").on("click",(e=>{e.preventDefault();const whichAction=$("#control-append").val(),whichTarget=$("#control-append-what").val(),$firstOpt=$demo.find('option:not([value="'.concat(window.optis[0].placeholderValue,'"])')).first(),$firstOptgroup=$demo.find("optgroup").first(),$lastOpt=$demo.find('option:not([value="'.concat(window.optis[0].placeholderValue,'"])')).last(),$lastOptgroup=$demo.find("optgroup").last(),$lastNonEmptyOptgroup=$demo.find("optgroup:has(option)").last(),$lastOptgroupFirstOpt=$lastNonEmptyOptgroup.find("option").first(),$lastOptgroupLastOpt=$lastNonEmptyOptgroup.find("option").last();switch(whichAction){case"append":switch(whichTarget){case"opt":$demo.append(addOption());break;case"optgroup":$demo.append(addOptgroup());break;case"optgroupOpt":$lastOptgroup.append(addOption())}break;case"prepend":switch(whichTarget){case"opt":addOption().insertBefore($firstOpt);break;case"optgroup":$demo.prepend(addOptgroup());break;case"optgroupOpt":$lastOptgroup.prepend(addOption())}break;case"rmvLast":switch(whichTarget){case"opt":$lastOpt.remove();break;case"optgroup":$lastOptgroup.remove();break;case"optgroupOpt":$lastOptgroupLastOpt.remove()}break;case"rmvFirst":switch(whichTarget){case"opt":$firstOpt.remove();break;case"optgroup":$firstOptgroup.remove();break;case"optgroupOpt":$lastOptgroupFirstOpt.remove()}}})),$("#insertoptrandomly").on("click",(e=>{e.preventDefault();const randomLocation=getRandomInt($demo.find("optgroup, option").length);0===randomLocation?addOption().prependTo($demo):addOption().insertAfter($demo.find("optgroup, option").eq(randomLocation))})),$("#togglemultiselect").on("click",(e=>{const demoIsMulti="multiple"==$demo.attr("multiple");e.preventDefault(),$(e.target).toggleClass("on"),demoIsMulti?$demo.removeAttr("multiple"):$demo.attr("multiple","multiple")})),$("#toggledisabselect").on("click",(e=>{const demoIsDisab="disabled"==$demo.attr("disabled");e.preventDefault(),$(e.target).toggleClass("on"),demoIsDisab?$demo.removeAttr("disabled"):$demo.attr("disabled","disabled")})),$("#toggledisabopt").on("click",(e=>{const $secondOpt=$demo.find("option").eq(2),optIsDisab="disabled"==$secondOpt.attr("disabled");e.preventDefault(),$(e.target).toggleClass("on"),optIsDisab?$secondOpt.removeAttr("disabled"):$secondOpt.attr("disabled","disabled")})),$("#destroy").on("click",(e=>{e.preventDefault(),window.optis[0].destroy(!0)})),$("#reinst").on("click",(e=>{e.preventDefault(),$("#demo").opti({useFirstOptionAsPlaceholder:!0}),$demoOpti=$demo.next(".opti"),$demoOpti.attr("data-theme",$("#theme-switch").val()),$demoOpti.attr("data-scheme",$("#scheme-switch-tick").is(":checked")?"dark":"light")})),$("#activatedlocked").on("click",(e=>{e.preventDefault(),$("#demo-opti").toggleClass("activatedLocked"),$(e.target).toggleClass("on")}));
//# sourceMappingURL=main.js.map