import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Shield, AlertTriangle, TrendingUp, Info, Save, RotateCcw } from 'lucide-react';
import { useBCCCompliance } from '../../../hooks/useBCCCompliance';

interface BCCParametersPanelProps {
  portfolioId?: string;
}

export const BCCParametersPanel: React.FC<BCCParametersPanelProps> = ({ portfolioId }) => {
  const {
    references,
    preferences,
    loading,
    saving,
    validationErrors,
    updatePreference,
    updateAlertThreshold,
    savePreferences,
    resetPreferences,
  } = useBCCCompliance({ portfolioId });

  const handleSave = async () => {
    const success = await savePreferences();
    if (success) {
      console.log('Préférences BCC sauvegardées');
    }
  };

  const handleReset = () => {
    resetPreferences();
  };

  if (loading || !references || !preferences) {
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
        <h3 className="text-lg font-semibold">Paramètres BCC</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Valeurs par défaut
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSave} disabled={saving || validationErrors.length > 0}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Erreurs de validation :</span>
            </div>
            <ul className="mt-2 text-sm text-red-700 dark:text-red-400">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Section Info BCC - Compacte */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-sm">
            <Info className="h-4 w-4" />
            Références BCC Instruction 004 (RDC)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          <Badge variant="primary" className="text-xs">NPL ≤ {references.maxNplRatio}%</Badge>
          <Badge variant="primary" className="text-xs">ROA ≥ {references.minRoa}%</Badge>
          <Badge variant="primary" className="text-xs">Rendement ≥ {references.minPortfolioYield}%</Badge>
          <Badge variant="primary" className="text-xs">Recouvrement ≥ {references.minCollectionEfficiency}%</Badge>
          <Badge variant="primary" className="text-xs">Délai ≤ {references.maxProcessingTime}j</Badge>
        </CardContent>
      </Card>

      {/* Qualité du Portefeuille */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-green-600" />
            Qualité du Portefeuille
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="npl">NPL Max (%)</Label>
            <Input
              id="npl"
              type="number"
              min="0"
              max={references.maxNplRatio}
              step="0.1"
              value={preferences.maxNplRatio}
              onChange={(e) => updatePreference('maxNplRatio', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≤ {references.maxNplRatio}% (BCC)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="writeoff">Abandon Max (%)</Label>
            <Input
              id="writeoff"
              type="number"
              min="0"
              max={references.maxWriteOffRatio}
              step="0.1"
              value={preferences.maxWriteOffRatio}
              onChange={(e) => updatePreference('maxWriteOffRatio', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≤ {references.maxWriteOffRatio}% (BCC)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recovery">Récupération Min (%)</Label>
            <Input
              id="recovery"
              type="number"
              min={references.minRecoveryRate}
              max="100"
              step="1"
              value={preferences.minRecoveryRate}
              onChange={(e) => updatePreference('minRecoveryRate', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≥ {references.minRecoveryRate}% (BCC)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rentabilité */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Rentabilité
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="roa">ROA Min (%)</Label>
            <Input
              id="roa"
              type="number"
              min={references.minRoa}
              max="20"
              step="0.1"
              value={preferences.minRoa}
              onChange={(e) => updatePreference('minRoa', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≥ {references.minRoa}% (BCC)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="yield">Rendement Min (%)</Label>
            <Input
              id="yield"
              type="number"
              min={references.minPortfolioYield}
              max="50"
              step="0.1"
              value={preferences.minPortfolioYield}
              onChange={(e) => updatePreference('minPortfolioYield', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≥ {references.minPortfolioYield}% (BCC)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Efficacité Opérationnelle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Efficacité Opérationnelle
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="collection">Recouvrement Min (%)</Label>
            <Input
              id="collection"
              type="number"
              min={references.minCollectionEfficiency}
              max="100"
              step="1"
              value={preferences.minCollectionEfficiency}
              onChange={(e) => updatePreference('minCollectionEfficiency', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≥ {references.minCollectionEfficiency}% (BCC)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="processing">Délai Max (jours)</Label>
            <Input
              id="processing"
              type="number"
              min="1"
              max={references.maxProcessingTime}
              step="1"
              value={preferences.maxProcessingTime}
              onChange={(e) => updatePreference('maxProcessingTime', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≤ {references.maxProcessingTime} jours (BCC)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seuils d'Alerte */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Alertes Personnalisées
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="npl-warning">Alerte NPL (%)</Label>
            <Input
              id="npl-warning"
              type="number"
              min="0"
              max={preferences.maxNplRatio}
              step="0.1"
              value={preferences.alertThresholds.nplWarningRatio}
              onChange={(e) => updateAlertThreshold('nplWarningRatio', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Alerte avant seuil critique</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roa-warning">Alerte ROA (%)</Label>
            <Input
              id="roa-warning"
              type="number"
              min={references.minRoa}
              max={preferences.minRoa}
              step="0.1"
              value={preferences.alertThresholds.roaWarningLevel}
              onChange={(e) => updateAlertThreshold('roaWarningLevel', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Alerte si ROA descend</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="efficiency-warning">Alerte Efficacité (%)</Label>
            <Input
              id="efficiency-warning"
              type="number"
              min="0"
              max={preferences.minCollectionEfficiency}
              step="1"
              value={preferences.alertThresholds.efficiencyWarningLevel}
              onChange={(e) => updateAlertThreshold('efficiencyWarningLevel', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Alerte si efficacité descend</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};