import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { empresaService } from '../services/empresaService';
import { Empresa } from '../types/empresa';
import { mostrarMensagem } from '../utils/dialogos';

export type StatusLocalizacao = 'ocioso' | 'negada' | 'carregando' | 'erro' | 'pronto';

export function useEmpresasProximas() {
  const [status, setStatus] = useState<StatusLocalizacao>('ocioso');
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const buscarEmpresasProximas = useCallback(async () => {
    setStatus('carregando');
    setError(null);

    try {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();

      if (permStatus !== 'granted') {
        setStatus('negada');
        await mostrarMensagem(
          'Permissão necessária',
          'Permita o acesso à sua localização para encontrarmos estabelecimentos próximos.'
        );
        return;
      }

      let location: Location.LocationObject;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch {
        setError('Não foi possível obter a sua localização. Verifique se o GPS está ativo.');
        setStatus('erro');
        return;
      }

      const { latitude, longitude } = location.coords;
      const data = await empresaService.listarProximas(latitude, longitude, 5);
      setEmpresas(Array.isArray(data) ? data : []);
      setStatus('pronto');
    } catch {
      setError('Não foi possível carregar as empresas próximas.');
      setStatus('erro');
    }
  }, []);

  const loading = status === 'carregando';

  return {
    status,
    buscarEmpresasProximas,
    loading,
    error,
    empresas,
  };
}
