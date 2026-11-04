import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { useAuth } from '../../contexts/AuthContext';
import { empresaService } from '../../services/empresaService';
import { useEmpresasProximas } from '../../hooks/useEmpresasProximas';
import { Empresa } from '../../types/empresa';
import { MIN_CARACTERES_BUSCA } from '../../constants/agenda';
import { obterSaudacao, formatarDataExtenso } from '../../utils/formatadores';
import EmpresaCard from '../../components/EmpresaCard';
import EstadoTela from '../../components/EstadoTela';
import Botao from '../../components/Botao';
import Footer from '../../components/Footer';

type TipoFiltro = 'nome' | 'cidade' | 'proximas';

export default function BuscarScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const telaGrande = width >= 768;
  const { cores, idioma, t } = usePreferencias();
  const { nomeUsuario } = useAuth();

  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('nome');
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState<Empresa[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [jaBuscou, setJaBuscou] = useState(false);

  const reqIdRef = useRef(0);

  const {
    buscarEmpresasProximas,
    loading: carregandoProximas,
    error: erroProximas,
    empresas: empresasProximas,
    status: statusProximas,
  } = useEmpresasProximas();

  const dataAtual = formatarDataExtenso(idioma);
  const saudacao = obterSaudacao(idioma);

  const handleMudarFiltro = (tipo: TipoFiltro) => {
    setTipoFiltro(tipo);
    setErro(null);
    if (tipo === 'proximas') {
      setJaBuscou(true);
      buscarEmpresasProximas();
    }
  };

  const handleBuscar = async () => {
    if (tipoFiltro === 'proximas') {
      setJaBuscou(true);
      buscarEmpresasProximas();
      return;
    }

    const termo = termoBusca.trim();
    if (termo.length < MIN_CARACTERES_BUSCA) {
      return;
    }

    const currentReq = ++reqIdRef.current;
    setCarregando(true);
    setErro(null);
    setJaBuscou(true);

    try {
      let lista: Empresa[] = [];
      if (tipoFiltro === 'nome') {
        lista = await empresaService.filtrarPorNome(termo);
      } else if (tipoFiltro === 'cidade') {
        lista = await empresaService.filtrarPorCidade(termo);
      }

      if (currentReq === reqIdRef.current) {
        setResultados(Array.isArray(lista) ? lista : []);
      }
    } catch {
      if (currentReq === reqIdRef.current) {
        setErro(t('Não foi possível realizar a busca.', 'Search request failed.'));
        setResultados([]);
      }
    } finally {
      if (currentReq === reqIdRef.current) {
        setCarregando(false);
      }
    }
  };

  const listaExibicao = tipoFiltro === 'proximas' ? empresasProximas : resultados;
  const estaCarregando = tipoFiltro === 'proximas' ? carregandoProximas : carregando;
  const mensagemErro = tipoFiltro === 'proximas' ? erroProximas : erro;

  const termoValido = termoBusca.trim().length >= MIN_CARACTERES_BUSCA;
  const botaoDesabilitado = tipoFiltro !== 'proximas' && !termoValido;

  const obterPlaceholder = () => {
    if (tipoFiltro === 'nome') return t('Busque por nome', 'Search by name');
    if (tipoFiltro === 'cidade') return t('Busque por cidade', 'Search by city');
    return t('Busque por nome ou cidade', 'Search by name or city');
  };

  return (
    <FlatList
      data={listaExibicao}
      keyExtractor={(item) => item.id.toString()}
      key={telaGrande ? 'grid-2' : 'list-1'}
      numColumns={telaGrande ? 2 : 1}
      columnWrapperStyle={telaGrande ? styles.colunaGrid : undefined}
      style={[styles.container, { backgroundColor: cores.fundo }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.cabecalho}>
          {/* Saudação e Data */}
          <Text style={[styles.saudacao, { color: cores.textoPrimario }]}>
            {nomeUsuario ? `${saudacao}, ${nomeUsuario}` : saudacao}
          </Text>
          <Text style={[styles.data, { color: cores.textoSecundario }]}>{dataAtual}</Text>

          {/* Chips de filtro */}
          <View style={styles.chipsContainer}>
            <Pressable
              onPress={() => handleMudarFiltro('nome')}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    tipoFiltro === 'nome' ? cores.destaque : cores.superficie,
                  borderColor: tipoFiltro === 'nome' ? cores.destaque : cores.borda,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipTexto,
                  { color: tipoFiltro === 'nome' ? '#FFFFFF' : cores.textoSecundario },
                ]}
              >
                {t('Nome', 'Name')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleMudarFiltro('cidade')}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    tipoFiltro === 'cidade' ? cores.destaque : cores.superficie,
                  borderColor: tipoFiltro === 'cidade' ? cores.destaque : cores.borda,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipTexto,
                  { color: tipoFiltro === 'cidade' ? '#FFFFFF' : cores.textoSecundario },
                ]}
              >
                {t('Cidade', 'City')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleMudarFiltro('proximas')}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    tipoFiltro === 'proximas' ? cores.destaque : cores.superficie,
                  borderColor: tipoFiltro === 'proximas' ? cores.destaque : cores.borda,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipTexto,
                  { color: tipoFiltro === 'proximas' ? '#FFFFFF' : cores.textoSecundario },
                ]}
              >
                {t('Próximas', 'Nearby')}
              </Text>
            </Pressable>
          </View>

          {/* Campo e Botão de busca */}
          {tipoFiltro !== 'proximas' ? (
            <View style={styles.blocoBusca}>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: cores.superficie, borderColor: cores.borda },
                ]}
              >
                <Ionicons name="search" size={20} color={cores.textoTerciario} style={styles.iconeBusca} />
                <TextInput
                  value={termoBusca}
                  onChangeText={setTermoBusca}
                  placeholder={obterPlaceholder()}
                  placeholderTextColor={cores.textoTerciario}
                  style={[styles.input, { color: cores.textoPrimario }]}
                  returnKeyType="search"
                  onSubmitEditing={handleBuscar}
                />
                {termoBusca.length > 0 ? (
                  <Pressable onPress={() => setTermoBusca('')} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color={cores.textoTerciario} />
                  </Pressable>
                ) : null}
              </View>

              <Botao
                titulo={t('Buscar', 'Search')}
                onPress={handleBuscar}
                carregando={estaCarregando}
                desabilitado={botaoDesabilitado}
                variante="primario"
                style={styles.botaoBuscar}
              />

              {!termoValido && termoBusca.length > 0 ? (
                <Text style={[styles.avisoCaracteres, { color: cores.textoTerciario }]}>
                  {t(
                    `Digite pelo menos ${MIN_CARACTERES_BUSCA} caracteres para buscar`,
                    `Type at least ${MIN_CARACTERES_BUSCA} characters to search`
                  )}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      }
      renderItem={({ item }) => (
        <EmpresaCard
          empresa={item}
          telaGrande={telaGrande}
          onPress={() => router.push(`/empresa/${item.id}`)}
        />
      )}
      ListEmptyComponent={
        estaCarregando ? (
          <EstadoTela
            carregando
            texto={t('Buscando estabelecimentos...', 'Searching businesses...')}
          />
        ) : mensagemErro ? (
          <EstadoTela
            icone="alert-circle-outline"
            texto={mensagemErro}
            acao={{
              titulo: t('Tentar novamente', 'Try again'),
              onPress: handleBuscar,
            }}
          />
        ) : tipoFiltro === 'proximas' && statusProximas === 'negada' ? (
          <EstadoTela
            icone="location-outline"
            texto={t('Localização necessária', 'Location required')}
            subtexto={t(
              'Permita o acesso à localização para ver os estabelecimentos mais próximos.',
              'Allow location access to view closest businesses.'
            )}
            acao={{
              titulo: t('Habilitar localização', 'Enable location'),
              onPress: buscarEmpresasProximas,
            }}
          />
        ) : jaBuscou ? (
          <EstadoTela
            icone="search-outline"
            texto={t('Nenhum resultado encontrado', 'No results found')}
            subtexto={t(
              'Tente buscar por outro termo ou selecione uma opção diferente.',
              'Try searching with a different term or option.'
            )}
          />
        ) : (
          <EstadoTela
            icone="storefront-outline"
            texto={t('Encontre um estabelecimento', 'Find a business')}
            subtexto={t(
              'Pesquise pelo nome, cidade ou encontre os mais próximos.',
              'Search by name, city, or find closest to you.'
            )}
          />
        )
      }
      ListFooterComponent={<Footer />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: {
    marginBottom: 16,
  },
  saudacao: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  data: {
    fontSize: 14,
    marginBottom: 20,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  blocoBusca: {
    gap: 10,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  iconeBusca: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  botaoBuscar: {
    minHeight: 44,
  },
  avisoCaracteres: {
    fontSize: 12,
    marginTop: -4,
  },
  colunaGrid: {
    justifyContent: 'space-between',
  },
});
