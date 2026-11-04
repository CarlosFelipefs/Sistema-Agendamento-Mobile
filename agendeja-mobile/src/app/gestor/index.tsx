import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { useExigirLogin } from '../../hooks/useExigirLogin';
import { empresaService } from '../../services/empresaService';
import { geocodingService } from '../../services/geocodingService';
import { Servico, Profissional } from '../../types/empresa';
import { formatarPreco, formatarDuracao } from '../../utils/formatadores';
import { mostrarMensagem } from '../../utils/dialogos';
import CampoTexto from '../../components/CampoTexto';
import Botao from '../../components/Botao';

export default function GestorCadastrarScreen() {
  const router = useRouter();
  const { cores, t } = usePreferencias();
  const { logado, carregando: checandoAuth } = useExigirLogin();

  // Dados da Empresa
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [categoria, setCategoria] = useState('');

  // Coordenadas
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [buscandoCoords, setBuscandoCoords] = useState(false);

  // Listas Dinâmicas
  const [servicos, setServicos] = useState<Omit<Servico, 'id'>[]>([]);
  const [profissionais, setProfissionais] = useState<Omit<Profissional, 'id'>[]>([]);

  // Campos temporários para adição
  const [novoServicoNome, setNovoServicoNome] = useState('');
  const [novoServicoPreco, setNovoServicoPreco] = useState('');
  const [novoServicoDuracao, setNovoServicoDuracao] = useState('');

  const [novoProfissionalNome, setNovoProfissionalNome] = useState('');
  const [novoProfissionalEsp, setNovoProfissionalEsp] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
          t(
            'Não foi possível encontrar as coordenadas para o endereço informado.',
            'Could not find coordinates for this address.'
          )
        );
      }
    } catch {
      await mostrarMensagem(
        t('Erro', 'Error'),
        t('Falha ao buscar coordenadas.', 'Failed to search coordinates.')
      );
    } finally {
      setBuscandoCoords(false);
    }
  };

  const handleAbrirNoMapa = async () => {
    if (latitude === null || longitude === null) return;
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
      setErro(t('Nome do serviço é obrigatório (máximo 150 caracteres).', 'Service name is required (max 150 characters).'));
      return;
    }
    if (isNaN(precoNum) || precoNum < 0 || precoNum > 999999.99) {
      setErro(t('Preço do serviço inválido.', 'Invalid service price.'));
      return;
    }
    if (isNaN(duracaoNum) || duracaoNum <= 0) {
      setErro(t('Duração deve ser maior que 0 minutos.', 'Duration must be greater than 0 minutes.'));
      return;
    }

    setServicos((antigos) => [
      ...antigos,
      {
        nome: sNome,
        preco: precoNum,
        duracaoEmMinutos: duracaoNum,
      },
    ]);

    setNovoServicoNome('');
    setNovoServicoPreco('');
    setNovoServicoDuracao('');
    setErro(null);
  };

  const handleRemoverServico = (index: number) => {
    setServicos((antigos) => antigos.filter((_, i) => i !== index));
  };

  const handleAdicionarProfissional = () => {
    const pNome = novoProfissionalNome.trim();
    const pEsp = novoProfissionalEsp.trim();

    if (!pNome || pNome.length > 150) {
      setErro(t('Nome do profissional é obrigatório (máximo 150 caracteres).', 'Staff name is required (max 150 characters).'));
      return;
    }
    if (!pEsp || pEsp.length > 100) {
      setErro(t('Especialidade do profissional é obrigatória.', 'Staff specialty is required.'));
      return;
    }

    setProfissionais((antigos) => [
      ...antigos,
      {
        nome: pNome,
        especialidade: pEsp,
      },
    ]);

    setNovoProfissionalNome('');
    setNovoProfissionalEsp('');
    setErro(null);
  };

  const handleRemoverProfissional = (index: number) => {
    setProfissionais((antigos) => antigos.filter((_, i) => i !== index));
  };

  const handleCadastrarEmpresa = async () => {
    setErro(null);

    // Validações principais
    if (!nome.trim() || nome.trim().length > 100) {
      setErro(t('Nome da empresa é obrigatório (máximo 100 caracteres).', 'Business name is required (max 100 characters).'));
      return;
    }
    if (!endereco.trim() || endereco.trim().length > 200) {
      setErro(t('Endereço é obrigatório (máximo 200 caracteres).', 'Address is required (max 200 characters).'));
      return;
    }
    if (!cidade.trim() || cidade.trim().length > 100) {
      setErro(t('Cidade é obrigatória (máximo 100 caracteres).', 'City is required (max 100 characters).'));
      return;
    }
    if (!estado.trim() || estado.trim().length > 50) {
      setErro(t('Estado é obrigatório (máximo 50 caracteres).', 'State is required (max 50 characters).'));
      return;
    }
    if (!cep.trim() || cep.trim().length > 20) {
      setErro(t('CEP é obrigatório (máximo 20 caracteres).', 'Zip/CEP is required (max 20 characters).'));
      return;
    }
    if (!telefone.trim() || telefone.trim().length > 50) {
      setErro(t('Telefone é obrigatório (máximo 50 caracteres).', 'Phone is required (max 50 characters).'));
      return;
    }
    if (!categoria.trim() || categoria.trim().length > 100) {
      setErro(t('Categoria é obrigatória (máximo 100 caracteres).', 'Category is required (max 100 characters).'));
      return;
    }

    if (latitude === null || longitude === null) {
      setErro(t('Busque a localização antes de cadastrar!', 'Search coordinates before registering!'));
      return;
    }

    setSalvando(true);
    try {
      await empresaService.cadastrarEmpresa({
        nome: nome.trim(),
        endereco: endereco.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        cep: cep.trim(),
        telefone: telefone.trim(),
        categoria: categoria.trim(),
        latitude,
        longitude,
        servicos: servicos as Servico[],
        profissionais: profissionais as Profissional[],
      });

      await mostrarMensagem(
        t('Sucesso!', 'Success!'),
        t('Empresa cadastrada com sucesso!', 'Business registered successfully!')
      );

      // Limpar formulário
      setNome('');
      setEndereco('');
      setCidade('');
      setEstado('');
      setCep('');
      setTelefone('');
      setCategoria('');
      setLatitude(null);
      setLongitude(null);
      setServicos([]);
      setProfissionais([]);
    } catch (err: any) {
      setErro(err?.mensagem || t('Não foi possível cadastrar a empresa.', 'Unable to register business.'));
    } finally {
      setSalvando(false);
    }
  };

  if (checandoAuth || !logado) {
    return null;
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
          <View style={styles.topoLinha}>
            <Text style={[styles.titulo, { color: cores.textoPrimario }]}>
              {t('Cadastrar Empresa', 'Register Business')}
            </Text>
            <Botao
              titulo={t('Ver Cadastradas', 'View All')}
              onPress={() => router.push('/gestor/empresas')}
              variante="secundario"
              style={styles.botaoVerTodas}
            />
          </View>

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
              placeholder={t('Nome comercial', 'Trade name')}
            />

            <CampoTexto
              rotulo={t('Categoria', 'Category')}
              valor={categoria}
              aoMudar={setCategoria}
              placeholder={t('Ex: Barbearia, Salão, Clínica', 'Ex: Barbershop, Salon, Clinic')}
            />

            <CampoTexto
              rotulo={t('Telefone', 'Phone')}
              valor={telefone}
              aoMudar={setTelefone}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
            />
          </View>

          {/* Endereço e Localização */}
          <View style={[styles.cardSecao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Text style={[styles.secaoTitulo, { color: cores.textoPrimario }]}>
              {t('Endereço e Coordenadas', 'Address & Coordinates')}
            </Text>

            <CampoTexto
              rotulo={t('Endereço (Rua, Número, Bairro)', 'Address')}
              valor={endereco}
              aoMudar={setEndereco}
              placeholder={t('Rua das Flores, 123', '123 Main St')}
            />

            <View style={styles.duasColunas}>
              <CampoTexto
                rotulo={t('Cidade', 'City')}
                valor={cidade}
                aoMudar={setCidade}
                placeholder={t('Cidade', 'City')}
                containerStyle={styles.colunaMeio}
              />
              <CampoTexto
                rotulo={t('Estado (UF)', 'State')}
                valor={estado}
                aoMudar={setEstado}
                placeholder="SP"
                containerStyle={styles.colunaMeio}
              />
            </View>

            <CampoTexto
              rotulo={t('CEP', 'Zip Code')}
              valor={cep}
              aoMudar={setCep}
              placeholder="00000-000"
              keyboardType="numeric"
            />

            <View style={styles.blocoCoordenadas}>
              <Botao
                titulo={t('Buscar Coordenadas (GPS)', 'Search Coordinates')}
                onPress={handleBuscarLocalizacao}
                carregando={buscandoCoords}
                variante="secundario"
              />

              {latitude !== null && longitude !== null ? (
                <View style={styles.linhaCoords}>
                  <Text style={[styles.textoCoords, { color: cores.textoSecundario }]}>
                    📍 {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </Text>
                  <Pressable onPress={handleAbrirNoMapa} hitSlop={10}>
                    <Text style={[styles.linkMapa, { color: cores.destaque }]}>
                      {t('Ver no mapa', 'View on map')} ↗
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>

          {/* Serviços */}
          <View style={[styles.cardSecao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Text style={[styles.secaoTitulo, { color: cores.textoPrimario }]}>
              {t('Serviços Oferecidos', 'Services')}
            </Text>

            {servicos.map((s, idx) => (
              <View
                key={idx}
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
                <Pressable onPress={() => handleRemoverServico(idx)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={20} color={cores.perigo} />
                </Pressable>
              </View>
            ))}

            <View style={styles.formAdicionar}>
              <CampoTexto
                rotulo={t('Nome do Serviço', 'Service Name')}
                valor={novoServicoNome}
                aoMudar={setNovoServicoNome}
                placeholder={t('Ex: Corte Masculino', 'Ex: Haircut')}
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
                key={idx}
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
                <Pressable onPress={() => handleRemoverProfissional(idx)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={20} color={cores.perigo} />
                </Pressable>
              </View>
            ))}

            <View style={styles.formAdicionar}>
              <CampoTexto
                rotulo={t('Nome do Profissional', 'Staff Name')}
                valor={novoProfissionalNome}
                aoMudar={setNovoProfissionalNome}
                placeholder={t('Ex: Carlos Alberto', 'Ex: John Doe')}
              />
              <CampoTexto
                rotulo={t('Especialidade', 'Specialty')}
                valor={novoProfissionalEsp}
                aoMudar={setNovoProfissionalEsp}
                placeholder={t('Ex: Barba & Cabelo', 'Ex: Master Stylist')}
              />
              <Botao
                titulo={t('+ Adicionar Profissional', '+ Add Staff')}
                onPress={handleAdicionarProfissional}
                variante="secundario"
              />
            </View>
          </View>

          {/* Botão Cadastrar */}
          <Botao
            titulo={t('Cadastrar Empresa', 'Register Business')}
            onPress={handleCadastrarEmpresa}
            carregando={salvando}
            variante="primario"
            style={styles.botaoPrincipal}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  topoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  botaoVerTodas: {
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  botaoPrincipal: {
    marginTop: 8,
    marginBottom: 32,
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
