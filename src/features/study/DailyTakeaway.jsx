import { Card } from '../../components';

export default function DailyTakeaway({ takeaways }) {
  if (!takeaways || takeaways.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 dark:text-gray-400">No takeaways yet. Keep practicing!</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Daily Takeaways</h3>
      <ul className="space-y-2">
        {takeaways.map((takeaway) => (
          <li key={takeaway.id} className="border-l-4 border-blue-500 pl-3">
            <span className="font-medium">{takeaway.word}</span>
            <p className="text-sm text-gray-600 dark:text-gray-300">{takeaway.definition}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
