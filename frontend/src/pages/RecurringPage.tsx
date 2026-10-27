import { useState } from 'react';
import { Fab } from '../components/Fab';
import { RecurringList } from '../components/RecurringList';
import { RecurringModal } from '../components/RecurringModal';
import { ScheduleView } from '../components/ScheduleView';
import { Tabs } from '../components/Tabs';

type View = 'calendar' | 'list';

export function RecurringPage() {
  const [view, setView] = useState<View>('calendar');
  //Il + del telefono apre la creazione da entrambe le viste
  const [creating, setCreating] = useState(false);

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

      <Fab icon="plus" label="Nuova spesa ricorrente" onClick={() => setCreating(true)} />

      {creating && <RecurringModal onClose={() => setCreating(false)} />}
    </div>
  );
}