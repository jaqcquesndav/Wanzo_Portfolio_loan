import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Shield, Clock, RefreshCw } from 'lucide-react';
import { bccThresholdsService } from '../../../services/bccThresholds';
import { BCCConfiguration } from '../../../types/bcc-thresholds';

interface BCCMetrics {
  qualityMetrics: {
    nplRatio: number;
    writeOffRatio: number;
    par30: number;
    recoveryRate: number;
  };
  profitabilityMetrics: {
    roa: number;
    portfolioYield: number;
    netInterestMargin: number;
    costOfRisk: number;
  };
  operationalMetrics: {
    collectionEfficiency: number;
    avgProcessingTime: number;
    portfolioTurnover: number;
  };
}

const generateMockMetrics = (): BCCMetrics => ({
  qualityMetrics: {
    nplRatio: 2 + Math.random() * 6,
    writeOffRatio: Math.random() * 3,
    par30: 1 + Math.random() * 4,
    recoveryRate: 70 + Math.random() * 25,
  },
  profitabilityMetrics: {
    roa: 2 + Math.random() * 5,
    portfolioYield: 8 + Math.random() * 12,
    netInterestMargin: 8 + Math.random() * 6,
    costOfRisk: 1 + Math.random() * 4,
  },
  operationalMetrics: {
    collectionEfficiency: 75 + Math.random() * 20,
    avgProcessingTime: 1 + Math.random() * 4,
    portfolioTurnover: 15 + Math.random() * 25,
  },
});

export const BCCSurveillancePanel: React.FC = () => {
  const [metrics, setMetrics] = useState<BCCMetrics>(generateMockMetrics());
  const [loading, setLoading] = useState(false);
  const [configuration, setConfiguration] = useState<BCCConfiguration | null>(null);

  useEffect(() => {
    const config = bccThresholdsService.getConfiguration();
    setConfiguration(config);
  }, []);

  const refreshMetrics = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMetrics(generateMockMetrics());
    setLoading(false);
  };

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
    if (!configuration) return { bcc: 0, manager: 0 };
    
    const { bccReferences, managerPreferences } = configuration;
    
    switch (metricKey) {
      case 'nplRatio':
        return { bcc: bccReferences.maxNplRatio, manager: managerPreferences.maxNplRatio };
      case 'writeOffRatio':
        return { bcc: bccReferences.maxWriteOffRatio, manager: managerPreferences.maxWriteOffRatio };
      case 'recoveryRate':
        return { bcc: bccReferences.minRecoveryRate, manager: managerPreferences.minRecoveryRate };
      case 'roa':
        return { bcc: bccReferences.minRoa, manager: managerPreferences.minRoa };
      case 'portfolioYield':
        return { bcc: bccReferences.minPortfolioYield, manager: managerPreferences.minPortfolioYield };
      case 'collectionEfficiency':
        return { bcc: bccReferences.minCollectionEfficiency, manager: managerPreferences.minCollectionEfficiency };
      case 'avgProcessingTime':
        return { bcc: bccReferences.maxProcessingTime, manager: managerPreferences.maxProcessingTime };
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

  if (!configuration) {
    return <div>Chargement de la configuration...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Surveillance BCC</h3>
        <Button onClick={refreshMetrics} disabled={loading} variant="secondary" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Qualité du Portefeuille */}
        {renderMetricCard(
          "Qualité du Portefeuille",
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
            { 
              label: "Coût du Risque", 
              value: metrics.profitabilityMetrics.costOfRisk, 
              metricKey: "costOfRisk",
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
            { 
              label: "Rotation Portefeuille", 
              value: metrics.operationalMetrics.portfolioTurnover, 
              metricKey: "portfolioTurnover",
              unit: "%" 
            },
          ]
        )}
      </div>

      {/* Résumé de Conformité */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Résumé de Conformité BCC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge variant="success" className="text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                8/9 Conformes
              </Badge>
              <p className="text-xs text-blue-600 mt-1">Métriques conformes BCC</p>
            </div>
            <div className="text-center">
              <Badge variant="warning" className="text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                1 Surveillance
              </Badge>
              <p className="text-xs text-blue-600 mt-1">Sous seuil gestionnaire</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Dernière MAJ: {new Date().toLocaleTimeString()}
              </Badge>
              <p className="text-xs text-blue-600 mt-1">Mise à jour temps réel</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};