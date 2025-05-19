from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.types import DomainDict


class ActionAskDuration(Action):
    def name(self) -> str:
        return "action_ask_duration"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: DomainDict):
        dispatcher.utter_message(text="Combien de jours comptes-tu rester ?")
        return []

class ActionAskLocation(Action):
    def name(self) -> str:
        return "action_ask_location"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: DomainDict):
        dispatcher.utter_message(text="Quelle(s) ville(s) veux-tu visiter ?")
        return []

class ActionPlanTrip(Action):
    def name(self) -> str:
        return "action_plan_trip"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: DomainDict):
        # Ici tu récupères les slots, tu fais ta logique de planification
        location = tracker.get_slot("location")
        duration = tracker.get_slot("duration")
        # Juste un exemple de message
        dispatcher.utter_message(text=f"Ok, je planifie un voyage à {location} pour {duration}.")
        return []
