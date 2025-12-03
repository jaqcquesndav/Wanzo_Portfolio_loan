import { useState, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Copy, Download, ZoomIn, BarChart, LineChart, PieChart } from 'lucide-react';
import { Button } from '../ui/Button';

// Lazy load Plotly pour réduire la taille du bundle initial
const Plot = lazy(() => import('react-plotly.js'));

interface MessageContentProps {
  content: string;
  onEdit?: (content: string) => void;
}

interface ChartData {
  type: 'bar' | 'line' | 'pie';
  data: Record<string, unknown>;
}

export function MessageContent({ content, onEdit }: MessageContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [isZoomed, setIsZoomed] = useState(false);

  const parseChartData = (code: string): ChartData | null => {
    try {
      const data: Record<string, unknown> = JSON.parse(code);
      return {
        type: 'bar',
        data
      };
    } catch {
      return null;
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleDownloadChart = (chartData: Record<string, unknown>) => {
    const blob = new Blob([JSON.stringify(chartData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chart-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = () => {
    onEdit?.(editedContent);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-32 p-2 border rounded-md"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <ReactMarkdown
          components={{
            code({ className, children }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              if (language === 'chart') {
                const chartData = parseChartData(String(children));
                if (!chartData) return null;

                return (
                  <div className="relative">
                    <div className="absolute top-2 right-2 flex space-x-2 z-10">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<ZoomIn />}
                        onClick={() => setIsZoomed(!isZoomed)}
                      >
                        {isZoomed ? 'Réduire' : 'Agrandir'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Download />}
                        onClick={() => handleDownloadChart(chartData.data)}
                      >
                        Données
                      </Button>
                      <div className="flex space-x-1">
                        <Button
                          variant={selectedChartType === 'bar' ? 'primary' : 'secondary'}
                          size="sm"
                          icon={<BarChart />}
                          onClick={() => setSelectedChartType('bar')}
                        />
                        <Button
                          variant={selectedChartType === 'line' ? 'primary' : 'secondary'}
                          size="sm"
                          icon={<LineChart />}
                          onClick={() => setSelectedChartType('line')}
                        />
                        <Button
                          variant={selectedChartType === 'pie' ? 'primary' : 'secondary'}
                          size="sm"
                          icon={<PieChart />}
                          onClick={() => setSelectedChartType('pie')}
                        />
                      </div>
                    </div>
                    <div className={isZoomed ? 'fixed inset-4 z-50 bg-white p-4 shadow-xl rounded-lg' : ''}>
                      <Suspense fallback={<div className="flex items-center justify-center h-96">Chargement du graphique...</div>}>
                        <Plot
                          data={[{
                            ...chartData.data,
                            type: selectedChartType
                          }]}
                          layout={{
                            autosize: true,
                            margin: { t: 60, r: 10, l: 60, b: 40 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent'
                          }}
                          style={{ width: '100%', height: isZoomed ? '90vh' : '400px' }}
                          config={{ responsive: true }}
                        />
                      </Suspense>
                    </div>
                  </div>
                );
              }

              return (
                <div className="relative group">
                  <button
                    className="absolute top-2 right-2 p-1 bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopyCode(String(children))}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0 }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            },
            p({ children }) {
              // Gérer les expressions mathématiques inline
              if (typeof children === 'string' && children.includes('$')) {
                const parts = children.split(/(\$.*?\$)/g);
                return (
                  <p>
                    {parts.map((part, i) => {
                      if (part.startsWith('$') && part.endsWith('$')) {
                        return (
                          <InlineMath key={i}>
                            {part.slice(1, -1)}
                          </InlineMath>
                        );
                      }
                      return part;
                    })}
                  </p>
                );
              }
              return <p>{children}</p>;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return renderContent();
}