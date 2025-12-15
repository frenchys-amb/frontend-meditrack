import { ChecklistFormState } from "@/types/forms";

const initialFormStateBase: ChecklistFormState = {
  // Generales
  date: new Date().toISOString().split("T")[0],
  ambulance: "",
  shift: "5am-5pm",

  // Mecánica
  millage: "",
  combustible: "Full",

  // Oxígeno
  oxigeno_m: "",
  oxigeno_e: "",

  // Fluidos (Por defecto en 'Ok')
  nivel_aceite_motor: "Ok",
  nivel_transmision: "Ok",
  nivel_frenos: "Ok",
  nivel_power_steering: "Ok",
  nivel_coolant: "Ok",
  observaciones: "",
};

export default initialFormStateBase;