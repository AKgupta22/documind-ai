import type { MessageBlock } from '@/lib/types';

export function MessageBlocks({ blocks }: { blocks: MessageBlock[] }) {
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h4 key={index} className="type-heading text-base">
              {block.text}
            </h4>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'code') {
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-md border border-border bg-surface-secondary p-3"
            >
              <code className="type-code">{block.code}</code>
            </pre>
          );
        }

        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}
