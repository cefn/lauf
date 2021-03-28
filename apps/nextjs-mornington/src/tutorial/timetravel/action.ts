import axios from "axios";
import { Action, planOfAction } from "@lauf/lauf-runner";

/** PROMPT THE USER FOR INPUT */

export class Prompt implements Action<string | null> {
  constructor(readonly message: string) {}
  act = () => window.prompt(this.message);
}
export const prompt = planOfAction(Prompt);

/** ALERT THE USER WITH A MESSAGE */

export class Alert implements Action<void> {
  constructor(readonly message: string) {}
  act = () => window.alert(this.message);
}
export const alert = planOfAction(Alert);

/** LOOK UP STATIONS BY NAME */

interface StationData {
  name: "Mornington Crescent";
  zone: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  latitude: number;
  longitude: number;
}

export class LookupStationData implements Action<Array<StationData>> {
  constructor(readonly name: string) {}
  act = async () => {
    const apiUrl = new URL("https://marquisdegeek.com/api/tube/");
    apiUrl.searchParams.append("name", this.name);
    const { data } = await axios.get<Array<StationData>>(apiUrl.toString());
    return data;
  };
}

export const lookupStationData = planOfAction(LookupStationData);
