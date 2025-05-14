let BPM = document.querySelector(".BPM");
BPM.onchange = bpmChanged;

function bpmChanged()
{
	window.max.outlet(BPM.value);
}