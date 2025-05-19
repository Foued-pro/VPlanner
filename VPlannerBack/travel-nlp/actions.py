from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SessionStarted, ActionExecuted, EventType
from rasa_sdk.types import DomainDict   
from typing import List


class ActionSessionStart(Action):
    def name(self) -> str:
        return "action_session_start"

    async def run(self, dispatcher, tracker, domain):
        events = [SessionStarted()]
        events.append(ActionExecuted("action_listen"))
        
        dispatcher.utter_message(template="utter_bienvenue")
        dispatcher.utter_message(template="utter_demande_lieu")
        
        return events
        
class ActionSubmitTripPlan(Action):
    def name(self) -> str:
        return "action_submit_trip_plan"

    def run(self, dispatcher, tracker, domain):
        lieu = tracker.get_slot("lieu")
        duree = tracker.get_slot("duree")
        
        response = f"✅ Voyage planifié !\nDestination: {lieu}\nDurée: {duree}"
        dispatcher.utter_message(text=response)
        
        return []