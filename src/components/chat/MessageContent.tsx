import { useState, lazy, Suspense, useRef, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InlineMath, BlockMath } from 'react-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Copy, Download, ZoomIn, BarChart, LineChart, PieChart, Check, Type, Eye } from 'lucide-react';
import { Button } from '../ui/Button';

// Lazy load Plotly pour réduire la taille du bundle initial
const Plot = lazy(() => import('react-plotly.js'));

interface MessageContentProps {
  content: string;
  onEdit?: (content: string) => void;
  isStreaming?: boolean;
}

interface ChartData {
  type: 'bar' | 'line' | 'pie';
  data: Record<string, unknown>;
}

export function MessageContent({ content, onEdit, isStreaming = false }: MessageContentProps) {
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
      <div className="space-y-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
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
                <div className="relative group bg-[#1e1e1e] border border-gray-700 rounded-lg overflow-hidden my-3">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <span className="text-xs font-medium text-gray-400 uppercase">
                      {language || 'code'}
                    </span>
                    <button
                      className="flex items-center space-x-1.5 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                      onClick={() => handleCopyCode(String(children))}
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copier</span>
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{ 
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      fontSize: '0.875rem'
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            },
            p({ children }) {
              // Gérer les expressions mathématiques en bloc $$...$$
              if (typeof children === 'string' && children.includes('$$')) {
                const parts = children.split(/(\$\$.*?\$\$)/gs);
                return (
                  <div className="leading-relaxed mb-3">
                    {parts.map((part, i) => {
                      if (part.startsWith('$$') && part.endsWith('$$')) {
                        return (
                          <div key={i} className="my-4 overflow-x-auto">
                            <BlockMath>{part.slice(2, -2)}</BlockMath>
                          </div>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                );
              }
              // Gérer les expressions mathématiques inline $...$
              if (typeof children === 'string' && children.includes('$')) {
                const parts = children.split(/(\$[^$]+\$)/g);
                return (
                  <p className="leading-relaxed mb-3">
                    {parts.map((part, i) => {
                      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                        return <InlineMath key={i}>{part.slice(1, -1)}</InlineMath>;
                      }
                      return part;
                    })}
                  </p>
                );
              }
              return <p className="leading-relaxed mb-3">{children}</p>;
            },
            // Headings
            h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-medium mb-2 mt-2 first:mt-0">{children}</h3>,
            // Lists
            ul: ({ children }) => <ul className="list-disc list-outside space-y-1 ml-5 mb-3">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-outside space-y-1 ml-5 mb-3">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            // Blockquote
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary/50 pl-4 italic bg-gray-100 dark:bg-gray-800 py-2 pr-4 rounded-r-lg my-3">
                {children}
              </blockquote>
            ),
            // Links
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {children}
              </a>
            ),
            // Tables
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full border-collapse text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>,
            th: ({ children }) => <th className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{children}</th>,
            td: ({ children }) => <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">{children}</td>,
            // Strong & em
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>
          }}
        >
          {content}
        </ReactMarkdown>
        
        {/* Indicateur de streaming */}
        {isStreaming && content && (
          <div className="flex items-center space-x-2 mt-2 pt-2">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Génération en cours...</span>
          </div>
        )}
      </div>
    );
  };

  return renderContent();
}