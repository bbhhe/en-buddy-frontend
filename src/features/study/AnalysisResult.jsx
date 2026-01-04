import { Card } from '../../components';

export default function AnalysisResult({ analysis }) {
  if (!analysis) {
    return null;
  }

  return (
    <Card className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Analysis</h3>
      <div className="prose dark:prose-invert">
        {analysis.corrections && (
          <div className="mb-4">
            <h4 className="font-medium">Corrections</h4>
            <ul className="list-disc pl-5">
              {analysis.corrections.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {analysis.suggestions && (
          <div>
            <h4 className="font-medium">Suggestions</h4>
            <ul className="list-disc pl-5">
              {analysis.suggestions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
