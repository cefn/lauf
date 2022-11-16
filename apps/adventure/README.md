Somewhat equivalent to e.g. https://www.inklestudios.com/ink/web-tutorial/

# TODO

Add rewindable, resumable generator layer, with jog controls in Tracker view

Somehow render commands, snapshots in the table better

Use details mechanism to show the full (stringified) structure of each?

Calculate and display state diffs (triggered by Object.is) between... 
* previous step's onResolved value, and this step's onResumed value (outside this code) should be a quality alert?
* onResumed and onCommanded within the step (enacted by the synchronous sequence code)
* onCommanded and onResolved within the step (enacted during the completion of the (async?) operation)