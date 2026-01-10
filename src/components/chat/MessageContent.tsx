import { useState, lazy, Suspense, useRef, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Copy, Download, ZoomIn, BarChart, LineChart, PieChart, Check, Type, Eye } from 'lucide-react';
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
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize du textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    if (isEditing) {
      adjustTextareaHeight();
    }
  }, [isEditing, editedContent, adjustTextareaHeight]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    adjustTextareaHeight();
  };

  // Raccourcis clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleSaveEdit = () => {
    onEdit?.(editedContent);
    setIsEditing(false);
    setShowPreview(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
    setShowPreview(false);
  };

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

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-3">
          {/* Toolbar avec tabs Éditer/Aperçu */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowPreview(false)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                  ${!showPreview 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Type className="h-3 w-3 inline mr-1.5" />
                Éditer
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                  ${showPreview 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Eye className="h-3 w-3 inline mr-1.5" />
                Aperçu
              </button>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              ⌘+Enter sauvegarder • Esc annuler
            </span>
          </div>

          {/* Zone d'édition ou aperçu */}
          {showPreview ? (
            <div className="min-h-[120px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <ReactMarkdown>{editedContent}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={editedContent}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message... (Markdown supporté)"
              className="
                w-full min-h-[120px] p-4 
                bg-gray-50 dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700 rounded-lg
                text-sm font-mono leading-relaxed
                text-gray-900 dark:text-gray-100
                resize-none overflow-hidden
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                transition-all
              "
            />
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {editedContent.length} caractères
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-1.5 text-sm bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors flex items-center"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Enregistrer
              </button>
            </div>
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