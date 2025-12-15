import { useInventoryStore } from "@/store/useInventoryStore";
import { InventoryMaps, InventoryItem } from "@/types/inventory";

export default function InventoryPage() {
  // Obtener inventario desde el store
  const inventory: InventoryMaps = useInventoryStore((s) => s.inventory);

  return (
    <div>
      {/* Recorrer categorías del inventario */}
      {Object.keys(inventory).map((category) => {
        const typedCategory = category as keyof InventoryMaps;
        const items: InventoryItem[] = inventory[typedCategory];

        return (
          <div key={category}>
            <h2>{category}</h2>

            {/* Recorrer items dentro de la categoría */}
            {items.map((item) => (
              <div key={item.id}>
                <strong>{item.name}</strong> — {item.quantity} unidades
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
