import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencias } from '../../../contexts/PreferenciasContext';
import { useExigirLogin } from '../../../hooks/useExigirLogin';
import { empresaService } from '../../../services/empresaService';
import { geocodingService } from '../../../services/geocodingService';
import { Servico, Profissional } from '../../../types/empresa';
import { formatarPreco, formatarDuracao } from '../../../utils/formatadores';
import { confirmar, mostrarMensagem } from '../../../utils/dialogos';
import CampoTexto from '../../../components/CampoTexto';
import Botao from '../../../components/Botao';
import EstadoTela from '../../../components/EstadoTela';

export default function GestorEmpresaEditarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cores, t } = usePreferencias();
  const { logado, carregando: checandoAuth } = useExigirLogin();

  const empresaId = Number(id);

  // Campos da Empresa
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [categoria, setCategoria] = useState('');

  // Latitude e Longitude preservadas ou recalculadas
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [buscandoCoords, setBuscandoCoords] = useState(false);

  // Listas de Serviços e Profissionais
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);

  // Adição de novos itens
  const [novoServicoNome, setNovoServicoNome] = useState('');
  const [novoServicoPreco, setNovoServicoPreco] = useState('');
  const [novoServicoDuracao, setNovoServicoDuracao] = useState('');

  const [novoProfissionalNome, setNovoProfissionalNome] = useState('');
  const [novoProfissionalEsp, setNovoProfissionalEsp] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarEmpresaCompleta = useCallback(async () => {
    if (isNaN(empresaId)) {
      setErro(t('Empresa não encontrada.', 'Business not found.'));
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      // 1. Busca por ID para obter servicos e profissionais
      const empDetalhada = await empresaService.buscarPorId(empresaId);

      // 2. Busca todas as empresas para obter latitude/longitude reais (pois GET /Empresa/{id} devolve 0)
      let latReal = 0;
      let lonReal = 0;
      try {
        const todas = await empresaService.listarTodas();
        const encontrada = todas.find((item) => item.id === empresaId);
        if (encontrada) {
          latReal = encontrada.latitude || 0;
          lonReal = encontrada.longitude || 0;
        }
      } catch {
        // Se falhar a listagem geral, mantém coordenadas existentes
      }

      setNome(empDetalhada.nome || '');
      setEndereco(empDetalhada.endereco || '');
      setCidade(empDetalhada.cidade || '');
      setEstado(empDetalhada.estado || '');
      setCep(empDetalhada.cep || '');
      setTelefone(empDetalhada.telefone || '');
      setCategoria(empDetalhada.categoria || '');

      setLatitude(latReal);
      setLongitude(lonReal);

      setServicos(empDetalhada.servicos || []);
      setProfissionais(empDetalhada.profissionais || []);
    } catch {
      setErro(t('Não foi possível carregar os dados da empresa.', 'Unable to load business details.'));
    } finally {
      setCarregando(false);
    }
  }, [empresaId, t]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (logado) {
      carregarEmpresaCompleta();
    }
  }, [logado, carregarEmpresaCompleta]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleBuscarLocalizacao = async () => {
    if (!endereco.trim() || !cidade.trim() || !estado.trim()) {
      await mostrarMensagem(
        t('Atenção', 'Warning'),
        t(
          'Preencha endereço, cidade e estado antes de buscar as coordenadas.',
          'Fill in address, city and state before searching coordinates.'
        )
      );
      return;
    }

    setBuscandoCoords(true);
    try {
      const coords = await geocodingService.buscarCoordenadas(
        endereco.trim(),
        cidade.trim(),
        estado.trim(),
        cep.trim()
      );

      if (coords) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        await mostrarMensagem(
          t('Localização encontrada', 'Location found'),
          `Lat: ${coords.latitude.toFixed(5)}, Lon: ${coords.longitude.toFixed(5)}`
        );
      } else {
        await mostrarMensagem(
          t('Não encontrada', 'Not found'),
          t('Coordenadas não encontradas para o endereço informado.', 'Coordinates not found.')
        );
      }
    } catch {
      await mostrarMensagem(t('Erro', 'Error'), t('Falha ao buscar coordenadas.', 'Failed to search coordinates.'));
    } finally {
      setBuscandoCoords(false);
    }
  };

  const handleAbrirNoMapa = async () => {
    if (!latitude && !longitude) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    try {
      await Linking.openURL(url);
    } catch {
      await mostrarMensagem(t('Erro', 'Error'), t('Não foi possível abrir o mapa.', 'Could not open map.'));
    }
  };

  const handleAdicionarServico = () => {
    const sNome = novoServicoNome.trim();
    const precoNum = parseFloat(novoServicoPreco.replace(',', '.'));
    const duracaoNum = parseInt(novoServicoDuracao, 10);

    if (!sNome || sNome.length > 150) {
      setErro(t('Nome do serviço é obrigatório (máximo 150 caracteres).', 'Service name is required.'));
      return;
    }
    if (isNaN(precoNum) || precoNum < 0 || precoNum > 999999.99) {
      setErro(t('Preço do serviço inválido.', 'Invalid price.'));
      return;
    }
    if (isNaN(duracaoNum) || duracaoNum <= 0) {
      setErro(t('Duração deve ser maior que 0 minutos.', 'Duration must be greater than 0.'));
      return;
    }

    setServicos((antigos) => [
      ...antigos,
      {
        id: 0, // id: 0 cria novo serviço no PUT do back-end
        nome: sNome,
        preco: precoNum,
        duracaoEmMinutos: duracaoNum,
        empresaId,
      },
    ]);

    setNovoServicoNome('');
    setNovoServicoPreco('');
    setNovoServicoDuracao('');
    setErro(null);
  };

  const handleRemoverServico = async (servico: Servico, index: number) => {
    if (servico.id > 0) {
      const confirmarRemover = await confirmar(
        t('Remover serviço?', 'Remove service?'),
        t(
          'Se houver agendamentos vinculados a este serviço, a atualização da empresa pode falhar.',
          'If there are appointments linked to this service, updating may fail.'
        ),
        { destrutivo: true }
      );
      if (!confirmarRemover) return;
    }
    setServicos((antigos) => antigos.filter((_, i) => i !== index));
  };

  const handleAdicionarProfissional = () => {
    const pNome = novoProfissionalNome.trim();
    const pEsp = novoProfissionalEsp.trim();

    if (!pNome || pNome.length > 150) {
      setErro(t('Nome do profissional é obrigatório (máximo 150 caracteres).', 'Staff name is required.'));
      return;
    }
    if (!pEsp || pEsp.length > 100) {
      setErro(t('Especialidade do profissional é obrigatória.', 'Specialty is required.'));
      return;
    }

    setProfissionais((antigos) => [
      ...antigos,
      {
        id: 0, // id: 0 cria novo profissional no PUT
        nome: pNome,
        especialidade: pEsp,
        empresaId,
      },
    ]);

    setNovoProfissionalNome('');
    setNovoProfissionalEsp('');
    setErro(null);
  };

  const handleRemoverProfissional = async (prof: Profissional, index: number) => {
    if (prof.id > 0) {
      const confirmarRemover = await confirmar(
        t('Remover profissional?', 'Remove staff?'),
        t(
          'Se houver agendamentos vinculados a este profissional, a atualização da empresa pode falhar.',
          'If there are appointments linked to this staff member, updating may fail.'
        ),
        { destrutivo: true }
      );
      if (!confirmarRemover) return;
    }
    setProfissionais((antigos) => antigos.filter((_, i) => i !== index));
  };

  const handleSalvarAlteracoes = async () => {
    setErro(null);

    if (!nome.trim() || nome.trim().length > 100) {
      setErro(t('Nome é obrigatório (máximo 100 caracteres).', 'Name is required.'));
      return;
    }
    if (!endereco.trim() || endereco.trim().length > 200) {
      setErro(t('Endereço é obrigatório (máximo 200 caracteres).', 'Address is required.'));
      return;
    }
    if (!cidade.trim() || cidade.trim().length > 100) {
      setErro(t('Cidade é obrigatória (máximo 100 caracteres).', 'City is required.'));
      return;
    }
    if (!estado.trim() || estado.trim().length > 50) {
      setErro(t('Estado é obrigatório (máximo 50 caracteres).', 'State is required.'));
      return;
    }
    if (!cep.trim() || cep.trim().length > 20) {
      setErro(t('CEP é obrigatório (máximo 20 caracteres).', 'CEP is required.'));
      return;
    }
    if (!telefone.trim() || telefone.trim().length > 50) {
      setErro(t('Telefone é obrigatório (máximo 50 caracteres).', 'Phone is required.'));
      return;
    }
    if (!categoria.trim() || categoria.trim().length > 100) {
      setErro(t('Categoria é obrigatória (máximo 100 caracteres).', 'Category is required.'));
      return;
    }

    setSalvando(true);
    try {
      await empresaService.atualizarEmpresa({
        id: empresaId,
        nome: nome.trim(),
        endereco: endereco.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        cep: cep.trim(),
        telefone: telefone.trim(),
        categoria: categoria.trim(),
        latitude,
        longitude,
        servicos,
        profissionais,
      });

      await mostrarMensagem(
        t('Sucesso!', 'Success!'),
        t('Empresa atualizada com sucesso!', 'Business updated successfully!')
      );

      router.back();
    } catch (err: any) {
      setErro(err?.mensagem || t('Não foi possível salvar as alterações.', 'Unable to save changes.'));
      // Recarrega dados para manter integridade com o servidor
      await carregarEmpresaCompleta();
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirEmpresa = async () => {
    const querExcluir = await confirmar(
      t('Excluir empresa?', 'Delete business?'),
      t(
        'Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.',
        'Are you sure you want to delete this business? This action cannot be undone.'
      ),
      {
        confirmar: t('Excluir', 'Delete'),
        cancelar: t('Cancelar', 'Cancel'),
        destrutivo: true,
      }
    );

    if (!querExcluir) return;

    setExcluindo(true);
    try {
      await empresaService.excluirEmpresa(empresaId);
      await mostrarMensagem(
        t('Excluída', 'Deleted'),
        t('Empresa excluída com sucesso.', 'Business deleted successfully.')
      );
      router.replace('/gestor/empresas');
    } catch {
      await mostrarMensagem(
        t('Não foi possível excluir', 'Unable to delete'),
        t(
          'Não foi possível excluir. A empresa pode ter agendamentos vinculados.',
          'Could not delete. The business may have existing appointments.'
        )
      );
    } finally {
      setExcluindo(false);
    }
  };

  if (checandoAuth || !logado) {
    return null;
  }

  if (carregando) {
    return (
      <View style={[styles.containerCentral, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.destaque} />
        <Text style={[styles.carregandoTexto, { color: cores.textoSecundario }]}>
          {t('Carregando informações da empresa...', 'Loading business info...')}
        </Text>
      </View>
    );
  }

  if (erro && !nome) {
    return (
      <View style={[styles.containerCentral, { backgroundColor: cores.fundo }]}>
        <EstadoTela
          icone="alert-circle-outline"
          texto={erro}
          acao={{
            titulo: t('Voltar', 'Go back'),
            onPress: () => router.back(),
          }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: cores.fundo }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.conteudo}>
          <Text style={[styles.titulo, { color: cores.textoPrimario }]}>
            {t('Gerenciar Empresa', 'Manage Business')}
          </Text>

          {erro ? (
            <View style={[styles.erroBox, { backgroundColor: cores.superficie, borderColor: cores.perigo }]}>
              <Text style={[styles.erroTexto, { color: cores.perigo }]}>{erro}</Text>
            </View>
          ) : null}

          {/* Dados Gerais */}
          <View style={[styles.cardSecao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Text style={[styles.secaoTitulo, { color: cores.textoPrimario }]}>
              {t('Dados Gerais', 'General Info')}
            </Text>

            <CampoTexto
              rotulo={t('Nome da Empresa', 'Business Name')}
              valor={nome}
              aoMudar={setNome}
            />

            <CampoTexto
              rotulo={t('Categoria', 'Category')}
              valor={categoria}
              aoMudar={setCategoria}
            />

            <CampoTexto
              rotulo={t('Telefone', 'Phone')}
              valor={telefone}
              aoMudar={setTelefone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Endereço e Coordenadas */}
          <View style={[styles.cardSecao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Text style={[styles.secaoTitulo, { color: cores.textoPrimario }]}>
              {t('Endereço e Coordenadas', 'Address & Coordinates')}
            </Text>

            <CampoTexto
              rotulo={t('Endereço', 'Address')}
              valor={endereco}
              aoMudar={setEndereco}
            />

            <View style={styles.duasColunas}>
              <CampoTexto
                rotulo={t('Cidade', 'City')}
                valor={cidade}
                aoMudar={setCidade}
                containerStyle={styles.colunaMeio}
              />
              <CampoTexto
                rotulo={t('Estado (UF)', 'State')}
                valor={estado}
                aoMudar={setEstado}
                containerStyle={styles.colunaMeio}
              />
            </View>

            <CampoTexto
              rotulo={t('CEP', 'Zip Code')}
              valor={cep}
              aoMudar={setCep}
              keyboardType="numeric"
            />

            <View style={styles.blocoCoordenadas}>
              <Botao
                titulo={t('Recalcular Coordenadas (GPS)', 'Recalculate Coordinates')}
                onPress={handleBuscarLocalizacao}
                carregando={buscandoCoords}
                variante="secundario"
              />

              <View style={styles.linhaCoords}>
                <Text style={[styles.textoCoords, { color: cores.textoSecundario }]}>
                  📍 {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </Text>
                {latitude !== 0 || longitude !== 0 ? (
                  <Pressable onPress={handleAbrirNoMapa} hitSlop={10}>
                    <Text style={[styles.linkMapa, { color: cores.destaque }]}>
                      {t('Ver no mapa', 'View on map')} ↗
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>

          {/* Serviços */}
          <View style={[styles.cardSecao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Text style={[styles.secaoTitulo, { color: cores.textoPrimario }]}>
              {t('Serviços Oferecidos', 'Services')}
            </Text>

            {servicos.map((s, idx) => (
              <View
                key={s.id || `novo-${idx}`}
                style={[
                  styles.itemLinha,
                  { backgroundColor: cores.superficie, borderColor: cores.borda },
                ]}
              >
                <View style={styles.itemTextoLinha}>
                  <Text style={[styles.itemNome, { color: cores.textoPrimario }]}>
                    {s.nome}
                  </Text>
                  <Text style={[styles.itemSub, { color: cores.textoSecundario }]}>
                    {formatarPreco(s.preco)} • {formatarDuracao(s.duracaoEmMinutos)}
                  </Text>
                </View>
                <Pressable onPress={() => handleRemoverServico(s, idx)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={20} color={cores.perigo} />
                </Pressable>
              </View>
            ))}

            <View style={styles.formAdicionar}>
              <CampoTexto
                rotulo={t('Novo Serviço', 'New Service')}
                valor={novoServicoNome}
                aoMudar={setNovoServicoNome}
                placeholder={t('Nome do serviço', 'Service name')}
              />
              <View style={styles.duasColunas}>
                <CampoTexto
                  rotulo={t('Preço (R$)', 'Price')}
                  valor={novoServicoPreco}
                  aoMudar={setNovoServicoPreco}
                  placeholder="35,00"
                  keyboardType="decimal-pad"
                  containerStyle={styles.colunaMeio}
                />
                <CampoTexto
                  rotulo={t('Duração (min)', 'Duration (min)')}
                  valor={novoServicoDuracao}
                  aoMudar={setNovoServicoDuracao}
                  placeholder="30"
                  keyboardType="number-pad"
                  containerStyle={styles.colunaMeio}
                />
              </View>
              <Botao
                titulo={t('+ Adicionar Serviço', '+ Add Service')}
                onPress={handleAdicionarServico}
                variante="secundario"
              />
            </View>
          </View>

          {/* Profissionais */}
          <View style={[styles.cardSecao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Text style={[styles.secaoTitulo, { color: cores.textoPrimario }]}>
              {t('Equipe de Profissionais', 'Staff Members')}
            </Text>

            {profissionais.map((p, idx) => (
              <View
                key={p.id || `novo-${idx}`}
                style={[
                  styles.itemLinha,
                  { backgroundColor: cores.superficie, borderColor: cores.borda },
                ]}
              >
                <View style={styles.itemTextoLinha}>
                  <Text style={[styles.itemNome, { color: cores.textoPrimario }]}>
                    {p.nome}
                  </Text>
                  <Text style={[styles.itemSub, { color: cores.textoSecundario }]}>
                    {p.especialidade}
                  </Text>
                </View>
                <Pressable onPress={() => handleRemoverProfissional(p, idx)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={20} color={cores.perigo} />
                </Pressable>
              </View>
            ))}

            <View style={styles.formAdicionar}>
              <CampoTexto
                rotulo={t('Novo Profissional', 'New Staff')}
                valor={novoProfissionalNome}
                aoMudar={setNovoProfissionalNome}
                placeholder={t('Nome', 'Name')}
              />
              <CampoTexto
                rotulo={t('Especialidade', 'Specialty')}
                valor={novoProfissionalEsp}
                aoMudar={setNovoProfissionalEsp}
                placeholder={t('Especialidade', 'Specialty')}
              />
              <Botao
                titulo={t('+ Adicionar Profissional', '+ Add Staff')}
                onPress={handleAdicionarProfissional}
                variante="secundario"
              />
            </View>
          </View>

          {/* Ações Rodapé */}
          <View style={styles.rodapeAcoes}>
            <Botao
              titulo={t('Salvar Alterações', 'Save Changes')}
              onPress={handleSalvarAlteracoes}
              carregando={salvando}
              variante="primario"
              style={styles.botaoSalvar}
            />
            <Botao
              titulo={t('Excluir Empresa', 'Delete Business')}
              onPress={handleExcluirEmpresa}
              carregando={excluindo}
              variante="perigo"
              style={styles.botaoExcluir}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerCentral: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  carregandoTexto: {
    fontSize: 15,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  conteudo: {
    maxWidth: 650,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSecao: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  duasColunas: {
    flexDirection: 'row',
    gap: 12,
  },
  colunaMeio: {
    flex: 1,
  },
  blocoCoordenadas: {
    gap: 8,
    marginTop: 4,
  },
  linhaCoords: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  textoCoords: {
    fontSize: 14,
  },
  linkMapa: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemTextoLinha: {
    flex: 1,
    gap: 2,
  },
  itemNome: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemSub: {
    fontSize: 13,
  },
  formAdicionar: {
    marginTop: 8,
    gap: 8,
  },
  rodapeAcoes: {
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  botaoSalvar: {
    minHeight: 46,
  },
  botaoExcluir: {
    minHeight: 46,
  },
  erroBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  erroTexto: {
    fontSize: 14,
  },
});
