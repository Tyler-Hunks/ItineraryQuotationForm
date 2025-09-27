import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface DynamicListProps {
  items: string[];
  onChange: (items: string[]) => void;
  presetItems: string[];
  testId?: string;
  addButtonTestId?: string;
}

export function DynamicList({ 
  items, 
  onChange, 
  presetItems, 
  testId,
  addButtonTestId 
}: DynamicListProps) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    // Allow removal of any item, including preset items
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const getLetter = (index: number) => {
    return String.fromCharCode(97 + index); // a, b, c, etc.
  };

  return (
    <Card className="bg-muted">
      <CardContent className="p-6 space-y-3">
        <div className="space-y-2" data-testid={testId} role="list" aria-label="Tour fair items list">
          {items.map((item, index) => (
            <div key={index} className="flex items-start space-x-3" role="listitem">
              <span className="text-primary font-medium mt-2" data-testid="text-item-letter" aria-hidden="true">
                {getLetter(index)})
              </span>
              <div className="flex-1 flex items-center space-x-2">
                {index < presetItems.length ? (
                  <span className="text-card-foreground flex-1 py-2">{item}</span>
                ) : (
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index] = e.target.value;
                      onChange(newItems);
                    }}
                    className="text-sm"
                    data-testid="input-custom-item"
                    aria-label={`Edit custom item ${getLetter(index)}`}
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive/80"
                  data-testid={index < presetItems.length ? "button-remove-preset" : "button-remove-item"}
                  aria-label={`Remove ${index < presetItems.length ? 'preset' : 'custom'} item ${getLetter(index)}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 mt-4">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter custom item..."
            className="text-sm"
            data-testid="input-new-item"
            aria-label="Enter new custom item"
            aria-describedby="add-item-help"
          />
          <Button
            type="button"
            onClick={addItem}
            variant="secondary"
            data-testid={addButtonTestId}
            aria-describedby="add-item-help"
          >
            + Add Item
          </Button>
        </div>
        <p id="add-item-help" className="text-xs text-muted-foreground mt-2">
          Press Enter or click Add Item to add a new custom entry to the list
        </p>
      </CardContent>
    </Card>
  );
}
