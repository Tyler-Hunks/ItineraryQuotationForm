import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, GripVertical } from "lucide-react";

interface EditableTemplateListProps {
  items: string[];
  onChange: (items: string[]) => void;
  presetItems: string[];
  testId?: string;
  addButtonTestId?: string;
}

export function EditableTemplateList({
  items,
  onChange,
  presetItems,
  testId,
  addButtonTestId
}: EditableTemplateListProps) {
  const [newItemText, setNewItemText] = useState("");
  
  // Safety check: ensure items is always an array
  const safeItems = items || [];

  const handleAdd = () => {
    if (newItemText.trim()) {
      onChange([...safeItems, newItemText.trim()]);
      setNewItemText("");
    }
  };

  const handleRemove = (index: number) => {
    const newItems = safeItems.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleEdit = (index: number, newValue: string) => {
    const newItems = [...safeItems];
    newItems[index] = newValue;
    onChange(newItems);
  };

  const renderEditableTemplate = (text: string, index: number) => {
    // Parse the text to find {{placeholder}} patterns
    const parts: { type: 'text' | 'placeholder', content: string }[] = [];
    const regex = /\{\{([^}]+)\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before placeholder
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      // Add placeholder
      parts.push({ type: 'placeholder', content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    // If no placeholders found, just show regular input
    if (parts.length === 0 || parts.every(p => p.type === 'text')) {
      return (
        <Input
          value={text}
          onChange={(e) => handleEdit(index, e.target.value)}
          className="flex-1"
          data-testid={`${testId}-item-${index}`}
        />
      );
    }

    // Render with editable placeholders
    return (
      <div className="flex-1 flex flex-wrap gap-1 items-center bg-background border border-input rounded-md px-3 py-2">
        {parts.map((part, partIndex) => {
          if (part.type === 'text') {
            return (
              <span key={partIndex} className="text-sm">
                {part.content}
              </span>
            );
          } else {
            return (
              <Input
                key={partIndex}
                value={part.content}
                onChange={(e) => {
                  const newParts = [...parts];
                  newParts[partIndex].content = e.target.value;
                  // Reconstruct the text
                  const newText = newParts.map(p => 
                    p.type === 'placeholder' ? `{{${p.content}}}` : p.content
                  ).join('');
                  handleEdit(index, newText);
                }}
                className="inline-flex h-7 px-2 py-1 text-sm font-mono bg-muted border-primary/50 min-w-[100px] max-w-[200px]"
                placeholder="enter value"
                data-testid={`${testId}-item-${index}-placeholder-${partIndex}`}
              />
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-3" data-testid={testId}>
      {safeItems.map((item, index) => (
        <Card key={index} className="p-3">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {renderEditableTemplate(item, index)}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(index)}
              className="flex-shrink-0"
              data-testid={`${testId}-remove-${index}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      <div className="flex gap-2">
        <Input
          placeholder="Add custom term..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          data-testid={`${testId}-new-input`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          data-testid={addButtonTestId}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {presetItems.length > 0 && safeItems.length === 0 && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-2">Quick add presets:</p>
          <div className="flex flex-wrap gap-2">
            {presetItems.map((preset, idx) => (
              <Button
                key={idx}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onChange([...safeItems, preset])}
              >
                {preset.length > 50 ? preset.substring(0, 50) + '...' : preset}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
