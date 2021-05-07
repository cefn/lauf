# D3 Experiment

The aim of this experiment is to show how yielding descriptions of async operations can facilitate logging, debugging and time-travel.

The first target is to visualise each action, reaction and state change in a single SVG layout. This layout will assign a distinct swim-lane to every ActionPlan, and show when new ActionPlans are spawned, as well as the events which take place in each. It should be possible to reveal more detail about each event.

Next steps - restructure the Tracker implementation, Forkhandles etc to be Immutable interfaces composed together into a structured interface representing a tracker state which can be the basis for a store.
