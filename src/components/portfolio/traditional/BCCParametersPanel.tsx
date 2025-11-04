import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Shield, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { bccThresholdsService } from '../../../services/bccThresholds';
import { ManagerPreferences, BCCOfficialReferences } from '../../../types/bcc-thresholds';

export const BCCParametersPanel: React.FC = () => {
  const [bccReferences, setBccReferences] = useState<BCCOfficialReferences | null>(null);
  const [managerPreferences, setManagerPreferences] = useState<ManagerPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const config = bccThresholdsService.getConfiguration();
    setBccReferences(config.bccReferences);
    setManagerPreferences(config.managerPreferences);
  }, []);

  const handleSave = async () => {
    if (!managerPreferences) return;
    
    setSaving(true);
    setErrors([]);
    
    try {
      await bccThresholdsService.saveManagerPreferences(managerPreferences, 'Gestionnaire Portfolio');
      console.log('Préférences sauvegardées avec succès');
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Erreur de sauvegarde']);
    }
    
    setSaving(false);
  };

  const handleReset = async () => {
    try {
      const defaultPreferences = await bccThresholdsService.resetManagerPreferences();
      setManagerPreferences(defaultPreferences);
      setErrors([]);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Erreur de remise à zéro']);
    }
  };

  const updatePreference = (field: keyof ManagerPreferences, value: number | object) => {
    if (!managerPreferences) return;
    
    setManagerPreferences(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
    
    // Validation en temps réel
    const tempPreferences = { ...managerPreferences, [field]: value };
    const validationErrors = bccThresholdsService.validateManagerPreferences(tempPreferences);
    setErrors(validationErrors);
  };

  const updateAlertThreshold = (field: keyof ManagerPreferences['alertThresholds'], value: number) => {
    if (!managerPreferences) return;
    
    const newAlertThresholds = {
      ...managerPreferences.alertThresholds,
      [field]: value
    };
    updatePreference('alertThresholds', newAlertThresholds);
  };

  if (!bccReferences || !managerPreferences) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Paramètres BCC</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Valeurs par défaut
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSave} disabled={saving || errors.length > 0}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Erreurs de validation :</span>
            </div>
            <ul className="mt-2 text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Section Info BCC */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            Références Officielles BCC
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Badge variant="primary">NPL ≤ {bccReferences.maxNplRatio}%</Badge>
            <p className="text-xs text-blue-600 mt-1">Ratio NPL Maximum</p>
          </div>
          <div className="text-center">
            <Badge variant="primary">ROA ≥ {bccReferences.minRoa}%</Badge>
            <p className="text-xs text-blue-600 mt-1">ROA Minimum</p>
          </div>
          <div className="text-center">
            <Badge variant="primary">Rendement ≥ {bccReferences.minPortfolioYield}%</Badge>
            <p className="text-xs text-blue-600 mt-1">Rendement Minimum</p>
          </div>
        </CardContent>
      </Card>

      {/* Qualité du Portefeuille */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Préférences - Qualité du Portefeuille
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="npl">NPL Ratio Maximum (%)</Label>
            <Input
              id="npl"
              type="number"
              min="0"
              max={bccReferences.maxNplRatio}
              step="0.1"
              value={managerPreferences.maxNplRatio}
              onChange={(e) => updatePreference('maxNplRatio', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≤ {bccReferences.maxNplRatio}% (BCC)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="writeoff">Abandon Créances Maximum (%)</Label>
            <Input
              id="writeoff"
              type="number"
              min="0"
              max={bccReferences.maxWriteOffRatio}
              step="0.1"
              value={managerPreferences.maxWriteOffRatio}
              onChange={(e) => updatePreference('maxWriteOffRatio', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≤ {bccReferences.maxWriteOffRatio}% (BCC)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recovery">Taux Récupération Minimum (%)</Label>
            <Input
              id="recovery"
              type="number"
              min={bccReferences.minRecoveryRate}
              max="100"
              step="1"
              value={managerPreferences.minRecoveryRate}
              onChange={(e) => updatePreference('minRecoveryRate', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≥ {bccReferences.minRecoveryRate}% (BCC)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rentabilité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Préférences - Rentabilité
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="roa">ROA Minimum (%)</Label>
            <Input
              id="roa"
              type="number"
              min={bccReferences.minRoa}
              max="20"
              step="0.1"
              value={managerPreferences.minRoa}
              onChange={(e) => updatePreference('minRoa', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≥ {bccReferences.minRoa}% (BCC)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="yield">Rendement Portefeuille Minimum (%)</Label>
            <Input
              id="yield"
              type="number"
              min={bccReferences.minPortfolioYield}
              max="50"
              step="0.1"
              value={managerPreferences.minPortfolioYield}
              onChange={(e) => updatePreference('minPortfolioYield', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≥ {bccReferences.minPortfolioYield}% (BCC)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Efficacité Opérationnelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Préférences - Efficacité Opérationnelle
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="collection">Efficacité Recouvrement Minimum (%)</Label>
            <Input
              id="collection"
              type="number"
              min={bccReferences.minCollectionEfficiency}
              max="100"
              step="1"
              value={managerPreferences.minCollectionEfficiency}
              onChange={(e) => updatePreference('minCollectionEfficiency', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≥ {bccReferences.minCollectionEfficiency}% (BCC)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="processing">Temps Traitement Maximum (jours)</Label>
            <Input
              id="processing"
              type="number"
              min="1"
              max={bccReferences.maxProcessingTime}
              step="1"
              value={managerPreferences.maxProcessingTime}
              onChange={(e) => updatePreference('maxProcessingTime', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Votre seuil ≤ {bccReferences.maxProcessingTime} jours (BCC)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seuils d'Alerte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Seuils d'Alerte Personnalisés
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="npl-warning">Alerte NPL (%)</Label>
            <Input
              id="npl-warning"
              type="number"
              min="0"
              max={managerPreferences.maxNplRatio}
              step="0.1"
              value={managerPreferences.alertThresholds.nplWarningRatio}
              onChange={(e) => updateAlertThreshold('nplWarningRatio', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Alerte avant seuil critique</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roa-warning">Alerte ROA (%)</Label>
            <Input
              id="roa-warning"
              type="number"
              min={bccReferences.minRoa}
              max={managerPreferences.minRoa}
              step="0.1"
              value={managerPreferences.alertThresholds.roaWarningLevel}
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
              max={managerPreferences.minCollectionEfficiency}
              step="1"
              value={managerPreferences.alertThresholds.efficiencyWarningLevel}
              onChange={(e) => updateAlertThreshold('efficiencyWarningLevel', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Alerte si efficacité descend</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};