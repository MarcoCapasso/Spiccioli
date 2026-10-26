import { useState } from 'react';
import { RecurringList } from '../components/RecurringList';
import { ScheduleView } from '../components/ScheduleView';
import { Tabs } from '../components/Tabs';

type View = 'calendar' | 'list';

export function RecurringPage() {
  const [view, setView] = useState<View>('calendar');

  return (
    <div className="stack">
      <div>
        <Tabs
          label="Vista"
          value={view}
          onChange={setView}
          options={[
            { value: 'calendar', label: 'Calendario' },
            { value: 'list', label: 'Elenco' },
          ]}
        />
      </div>

      {view === 'calendar' ? <ScheduleView /> : <RecurringList />}
    </div>
  );
}