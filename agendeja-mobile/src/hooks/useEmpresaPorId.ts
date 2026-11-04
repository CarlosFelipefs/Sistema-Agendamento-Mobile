import { useState, useEffect, useCallback } from 'react';
import { empresaService } from '../services/empresaService';
import { Empresa } from '../types/empresa';

export function useEmpresaPorId(id?: number | null) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarEmpresa = useCallback(async () => {
    if (!id || isNaN(id)) {
      setEmpresa(null);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const dados = await empresaService.buscarPorId(id);
      setEmpresa(dados);
    } catch {
      setErro('Empresa não encontrada.');
      setEmpresa(null);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    carregarEmpresa();
  }, [carregarEmpresa]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return {
    empresa,
    carregando,
    erro,
    recarregar: carregarEmpresa,
  };
}
