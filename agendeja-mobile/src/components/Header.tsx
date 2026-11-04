import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { useAuth } from '../contexts/AuthContext';
import { mostrarMensagem } from '../utils/dialogos';

export default function Header() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { cores, tema, idioma, alternarTema, alternarIdioma } = usePreferencias();
  const { logado, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleNotificacao = async () => {
    await mostrarMensagem(
      idioma === 'br' ? 'Em breve' : 'Coming soon',
      idioma === 'br'
        ? 'Funcionalidade de notificações será implementada em breve.'
        : 'Notifications feature will be implemented soon.'
    );
  };

  const handleSair = async () => {
    setMenuAberto(false);
    await sair();
    router.replace('/');
  };

  const handlePerfil = () => {
    setMenuAberto(false);
    router.push('/perfil');
  };

  const handleEntrar = () => {
    router.push('/login');
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: top, backgroundColor: cores.fundo }]}>
        <Pressable onPress={() => router.push('/')}>
          <Text style={[styles.logo, { color: cores.destaque }]}>AgendeJá</Text>
        </Pressable>

        <View style={styles.botoes}>
          <Pressable
            onPress={handleNotificacao}
            style={({ pressed }) => [
              styles.botaoIcone,
              {
                backgroundColor: pressed ? cores.botaoIconePressionado : cores.botaoIcone,
              },
            ]}
            hitSlop={10}
            accessibilityLabel={idioma === 'br' ? 'Notificações' : 'Notifications'}
          >
            <Ionicons name="notifications-outline" size={20} color={cores.textoPrimario} />
            <View style={[styles.bolinhaNotificacao, { backgroundColor: cores.notificacao }]} />
          </Pressable>

          <Pressable
            onPress={alternarIdioma}
            style={({ pressed }) => [
              styles.botaoIcone,
              {
                backgroundColor: pressed ? cores.botaoIconePressionado : cores.botaoIcone,
              },
            ]}
            hitSlop={10}
            accessibilityLabel={idioma === 'br' ? 'Alternar idioma' : 'Toggle language'}
          >
            <Text style={styles.bandeira}>{idioma === 'br' ? '🇧🇷' : '🇺🇸'}</Text>
          </Pressable>

          <Pressable
            onPress={alternarTema}
            style={({ pressed }) => [
              styles.botaoIcone,
              {
                backgroundColor: pressed ? cores.botaoIconePressionado : cores.botaoIcone,
              },
            ]}
            hitSlop={10}
            accessibilityLabel={idioma === 'br' ? 'Alternar tema' : 'Toggle theme'}
          >
            <Ionicons
              name={tema === 'dark' ? 'sunny' : 'moon'}
              size={20}
              color={tema === 'dark' ? '#FBBF24' : cores.textoPrimario}
            />
          </Pressable>

          {logado ? (
            <Pressable
              onPress={() => setMenuAberto(true)}
              style={({ pressed }) => [
                styles.botaoPerfil,
                {
                  backgroundColor: pressed ? cores.botaoIconePressionado : cores.botaoIcone,
                },
              ]}
              hitSlop={10}
              accessibilityLabel={idioma === 'br' ? 'Menu de perfil' : 'Profile menu'}
            >
              <Ionicons name="person" size={20} color={cores.textoPrimario} />
              <Ionicons name="chevron-down" size={16} color={cores.textoSecundario} style={styles.seta} />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleEntrar}
              style={({ pressed }) => [
                styles.botaoEntrar,
                {
                  backgroundColor: pressed ? cores.destaqueFoco : cores.destaque,
                },
              ]}
              hitSlop={10}
            >
              <Text style={styles.textoEntrar}>{idioma === 'br' ? 'Entrar' : 'Login'}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={() => setMenuAberto(false)}>
        <Pressable style={styles.modalFundo} onPress={() => setMenuAberto(false)}>
          <View style={[styles.menuCartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
            <Pressable
              onPress={handlePerfil}
              style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: pressed ? cores.botaoIconePressionado : 'transparent' },
              ]}
              hitSlop={10}
            >
              <Ionicons name="person" size={20} color={cores.textoPrimario} />
              <Text style={[styles.menuItemTexto, { color: cores.textoPrimario }]}>
                {idioma === 'br' ? 'Perfil' : 'Profile'}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSair}
              style={({ pressed }) => [
                styles.menuItem,
                styles.menuItemPerigo,
                {
                  backgroundColor: pressed ? cores.botaoIconePressionado : cores.perigo,
                },
              ]}
              hitSlop={10}
            >
              <Ionicons name="log-out" size={20} color="#FFFFFF" />
              <Text style={[styles.menuItemTexto, styles.menuItemTextoBranco]}>
                {idioma === 'br' ? 'Sair' : 'Logout'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  botoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botaoIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bolinhaNotificacao: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bandeira: {
    fontSize: 20,
  },
  botaoPerfil: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  seta: {},
  botaoEntrar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoEntrar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalFundo: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 16,
  },
  menuCartao: {
    width: 200,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    minHeight: 44,
  },
  menuItemPerigo: {},
  menuItemTexto: {
    fontSize: 14,
  },
  menuItemTextoBranco: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
