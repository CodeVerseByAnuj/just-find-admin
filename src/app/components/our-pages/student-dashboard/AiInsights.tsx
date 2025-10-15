"use client";
import React from "react";
import { Card } from "../../shadcn-ui/Default-Ui/card";
import { Icon } from "@iconify/react";

function AiInsights({aiInsights}: {aiInsights: string[]}) {
  return (
    <Card className="h-full overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
      </div>

      <ul className="mt-4 space-y-3 max-h-68 overflow-y-auto">
        {aiInsights.map((insight, idx) => (
          <li
            key={idx}
            className="flex gap-3 items-start dark:bg-muted/20 py-2 pb-4 border-b border-b-gray-200"
          >
            <span className="flex-shrink-0 mt-1 h-10 w-10 rounded-md flex items-center justify-center bg-primary/10 text-primary">
              <Icon icon="mdi:lightbulb-on-outline" width={18} aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-sm text-ld">{insight}</p>
              {/* <div className="mt-2 flex items-center gap-2 text-xs text-ld opacity-80">
                <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                  <Icon icon="mdi:clock-outline" width={14} />
                  <span>Recent</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                  <Icon icon="mdi:check-decagram-outline" width={14} />
                  <span>Recommendation</span>
                </span>
              </div> */}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default AiInsights;
