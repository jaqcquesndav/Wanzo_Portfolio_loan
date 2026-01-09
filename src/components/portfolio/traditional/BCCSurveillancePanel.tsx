import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Shield, Clock, RefreshCw, Activity } from 'lucide-react';
import { useBCCCompliance } from '../../../hooks/useBCCCompliance';

interface BCCSurveillancePanelProps {
  portfolioId?: string;
}

export const BCCSurveillancePanel: React.FC<BCCSurveillancePanelProps> = ({ portfolioId }) => {
  const {
    references,
    preferences,
    metrics,
    complianceStatus,
    loading,
    refreshMetrics,
  } = useBCCCompliance({ portfolioId, autoRefresh: true });

  const getComplianceStatus = (value: number, bccThreshold: number, managerThreshold: number, isMinThreshold: boolean = false) => {
    // Vérifier d'abord la conformité BCC (critique)
    const bccCompliant = isMinThreshold ? value >= bccThreshold : value <= bccThreshold;
    if (!bccCompliant) return 'danger';
    
    // Ensuite vérifier les préférences du gestionnaire
    const managerCompliant = isMinThreshold ? value >= managerThreshold : value <= managerThreshold;
    if (!managerCompliant) return 'warning';
    
    return 'success';
  };

  const getThresholds = (metricKey: string) => {
    if (!references || !preferences) return { bcc: 0, manager: 0 };
    
    switch (metricKey) {
      case 'nplRatio':
        return { bcc: references.maxNplRatio, manager: preferences.maxNplRatio };
      case 'writeOffRatio':
        return { bcc: references.maxWriteOffRatio, manager: preferences.maxWriteOffRatio };
      case 'recoveryRate':
        return { bcc: references.minRecoveryRate, manager: preferences.minRecoveryRate };
      case 'roa':
        return { bcc: references.minRoa, manager: preferences.minRoa };
      case 'portfolioYield':
        return { bcc: references.minPortfolioYield, manager: preferences.minPortfolioYield };
      case 'collectionEfficiency':
        return { bcc: references.minCollectionEfficiency, manager: preferences.minCollectionEfficiency };
      case 'avgProcessingTime':
        return { bcc: references.maxProcessingTime, manager: preferences.maxProcessingTime };
      default:
        return { bcc: 0, manager: 0 };
    }
  };

  const renderMetricCard = (
    title: string,
    icon: React.ReactNode,
    metricData: Array<{
      label: string;
      value: number;
      metricKey: string;
      isMinThreshold?: boolean;
      unit: string;
    }>
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {metricData.map(metric => {
            const thresholds = getThresholds(metric.metricKey);
            const status = getComplianceStatus(
              metric.value, 
              thresholds.bcc, 
              thresholds.manager, 
              metric.isMinThreshold
            );
            
            return (
              <div key={metric.label} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{metric.value.toFixed(1)}{metric.unit}</span>
                      <Badge variant={
                        status === 'success' ? 'success' : 
                        status === 'warning' ? 'warning' : 
                        'danger'
                      }>
                        {status === 'success' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : status === 'warning' ? (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {status === 'success' ? 'Conforme' : 
                         status === 'warning' ? 'Attention' : 
                         'Non-conforme BCC'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Gestionnaire: {metric.isMinThreshold ? '≥' : '≤'} {thresholds.manager}{metric.unit} | 
                    BCC: {metric.isMinThreshold ? '≥' : '≤'} {thresholds.bcc}{metric.unit}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  if (loading || !references || !preferences || !metrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Surveillance BCC
        </h3>
        <Button onClick={() => refreshMetrics()} disabled={loading} variant="secondary" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Qualité du Portefeuille */}
        {renderMetricCard(
          "Qualité Portefeuille",
          <Shield className="h-4 w-4 text-green-600" />,
          [
            { 
              label: "NPL Ratio", 
              value: metrics.qualityMetrics.nplRatio, 
              metricKey: "nplRatio",
              unit: "%" 
            },
            { 
              label: "Ratio d'Abandon", 
              value: metrics.qualityMetrics.writeOffRatio, 
              metricKey: "writeOffRatio",
              unit: "%" 
            },
            { 
              label: "Taux de Récupération", 
              value: metrics.qualityMetrics.recoveryRate, 
              metricKey: "recoveryRate",
              isMinThreshold: true, 
              unit: "%" 
            },
          ]
        )}

        {/* Rentabilité */}
        {renderMetricCard(
          "Rentabilité",
          <TrendingUp className="h-4 w-4 text-blue-600" />,
          [
            { 
              label: "ROA", 
              value: metrics.profitabilityMetrics.roa, 
              metricKey: "roa",
              isMinThreshold: true, 
              unit: "%" 
            },
            { 
              label: "Rendement Portefeuille", 
              value: metrics.profitabilityMetrics.portfolioYield, 
              metricKey: "portfolioYield",
              isMinThreshold: true, 
              unit: "%" 
            },
          ]
        )}

        {/* Efficacité Opérationnelle */}
        {renderMetricCard(
          "Efficacité Opérationnelle",
          <Clock className="h-4 w-4 text-orange-600" />,
          [
            { 
              label: "Efficacité Recouvrement", 
              value: metrics.operationalMetrics.collectionEfficiency, 
              metricKey: "collectionEfficiency",
              isMinThreshold: true, 
              unit: "%" 
            },
            { 
              label: "Temps Traitement Moyen", 
              value: metrics.operationalMetrics.avgProcessingTime, 
              metricKey: "avgProcessingTime",
              unit: " jours" 
            },
          ]
        )}
      </div>

      {/* Indicateurs Complémentaires (informatifs - sans seuil BCC) */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Indicateurs Complémentaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-mono font-semibold">{metrics.qualityMetrics.par30.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">PAR 30 jours</p>
            </div>
            <div>
              <p className="text-lg font-mono font-semibold">{metrics.profitabilityMetrics.costOfRisk.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Coût du Risque</p>
            </div>
            <div>
              <p className="text-lg font-mono font-semibold">{metrics.profitabilityMetrics.netInterestMargin.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Marge Nette</p>
            </div>
            <div>
              <p className="text-lg font-mono font-semibold">{metrics.operationalMetrics.portfolioTurnover.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Rotation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé de Conformité dynamique */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 dark:text-blue-300 text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Résumé Conformité BCC (RDC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center">
              <Badge variant="success" className="text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                {complianceStatus?.compliantCount || 0}/{(complianceStatus?.compliantCount || 0) + (complianceStatus?.warningCount || 0) + (complianceStatus?.nonCompliantCount || 0)} Conformes
              </Badge>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Métriques conformes BCC</p>
            </div>
            <div className="text-center">
              <Badge variant={complianceStatus?.nonCompliantCount ? 'danger' : 'warning'} className="text-sm">
                {complianceStatus?.nonCompliantCount ? (
                  <XCircle className="h-4 w-4 mr-1" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-1" />
                )}
                {complianceStatus?.nonCompliantCount || complianceStatus?.warningCount || 0} {complianceStatus?.nonCompliantCount ? 'Critiques' : 'Surveillance'}
              </Badge>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {complianceStatus?.nonCompliantCount ? 'Non-conformes BCC' : 'Sous seuil gestionnaire'}
              </p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Score: {complianceStatus?.overallScore?.toFixed(0) || 0}%
              </Badge>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Score global conformité</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};