export interface ClickLog {
  link_id: number;
  timestamp: Date;
  user_agent?: string;
  referrer?: string;
  device_type:
    | 'desktop'
    | 'mobile'
    | 'bot'
    | 'other';
}


export interface LinkAnalytics {
  link_id: number;
  code: string;
  total_clicks: number;

  by_device: {
    desktop: number;
    mobile: number;
    bot: number;
    other: number;
  };

  top_referrers: Record<string, number>;

  recent_clicks: ClickLog[];
}
