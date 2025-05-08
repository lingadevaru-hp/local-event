
import { EventDiscovery } from '@/components/event-discovery';

export default function AllEventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Re-using EventDiscovery component for consistency */}
      {/* It can be enhanced or a new component can be made if /events needs different features */}
      <EventDiscovery />
    </div>
  );
}

