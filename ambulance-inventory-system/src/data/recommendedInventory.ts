export const recommendedInventory = {
  // Signos Vitales
  "signos_vitales": {
    "tensiómetro": 1,
    "estetoscopio": 2,
    "termómetro": 2,
    "oxímetro de pulso": 2,
    "laringoscopio adulto": 1,
    "laringoscopio pediátrico": 1,
    "laringoscopio neonatal": 1,
  },

  // Aire / Oxígeno
  "aire_oxigeno": {
    "cánula nasal adulto": 10,
    "cánula nasal pediátrica": 10,
    "máscara venturi adulto": 5,
    "máscara venturi pediátrico": 5,
    "máscara no reinhalación adulto": 5,
    "máscara no reinhalación pediátrico": 5,
    "tubo endotraqueal adulto": 5,
    "tubo endotraqueal pediátrico": 5,
    "tubo endotraqueal neonatal": 5,
    "mascarilla laríngea adulto": 3,
    "mascarilla laríngea pediátrico": 3,
  },

  // Canalización
  "canalizacion": {
    "angio #14": 5,
    "catéter 16g": 10,
    "catéter 18g": 10,
    "catéter 20g": 10,
    "catéter 22g": 10,
    "catéter 24g": 5,
    "llave de 3 vías": 10,
    "equipo de venoclisis": 10,
    "cinta adhesiva": 2,
    "torundas alcoholadas": 20,
    "guantes estériles": 10,
  },

  // Misceláneos
  "miscelaneos": {
    "tijera recta": 2,
    "tijera curva": 2,
    "pinza hemostática": 2,
    "bolsa de bioseguridad": 10,
    "vendas elásticas": 5,
    "vendas de gasa": 10,
    "apósitos estériles": 10,
    "esparadrapo": 5,
    "gasas estériles": 20,
    "solución salina 500ml": 5,
    "solución salina 1000ml": 5,
  },



  // Medicamentos
  "medicamentos": {
    "adrenalina 1mg": 10,
    "atropina 0.5mg": 10,
    "amiodarona 150mg": 5,
    "lidocaína 2%": 5,
    "diazepam 10mg": 5,
    "midazolam 5mg": 5,
    "morfina 10mg": 5,
    "fentanilo 50mcg": 5,
    "dipirona 1g": 10,
    "paracetamol 1g": 10,
    "hidrocortisona 100mg": 5,
    "salbutamol inhalador": 5,
    "ácido tranexámico 500mg": 5,
  },

  // Entubación
  "entubacion": {
    "tubo endotraqueal 6.0": 5,
    "tubo endotraqueal 6.5": 5,
    "tubo endotraqueal 7.0": 5,
    "tubo endotraqueal 7.5": 5,
    "tubo endotraqueal 8.0": 5,
    "tubo endotraqueal 8.5": 5,
    "tubo endotraqueal 9.0": 5,
    "mandril guia": 5,
    "pinza magill": 2,
    "jeringa 10ml": 10,
    "jeringa 5ml": 10,
    "jeringa 3ml": 10,
  },

  // Equipo General
  "equipo_general": {
    "monitor cardíaco": 1,
    "desfibrilador": 1,
    "ventilador mecánico": 1,
    "bomba de infusión": 2,
    "aspirador de secreciones": 1,
    "camilla plegable": 1,
    "silla de ruedas": 1,
    "oxígeno medicinal": 2,
  }
};

// Función para obtener el inventario recomendado por categoría
export const getRecommendedByCategory = (category: string) => {
  // Le decimos a TS: "Trata esta string como una de las claves válidas de recommendedInventory"
  return recommendedInventory[category as keyof typeof recommendedInventory] || {};
};

// Función para obtener todas las categorías
export const getAllCategories = () => {
  return Object.keys(recommendedInventory);
};

// Función para obtener el inventario recomendado completo
export const getFullRecommendedInventory = () => {
  return recommendedInventory;
};