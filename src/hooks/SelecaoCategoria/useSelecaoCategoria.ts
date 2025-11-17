import { useEffect, useState } from 'react';
import { CategoriaService } from '../../services/api/categoria';
import { CategoriaTipo } from '@/src/enums/categoriaTipo';
import { CategoriaBasicaResponse } from '@/src/interfaces/categoria/response';


export const useSelecaoCategoria = (tipoTransacao: CategoriaTipo) => {

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaBasicaResponse | null>(null);
    const [criandoNova, setCriandoNova] = useState<boolean>(false);
    const [categorias, setCategorias] = useState<CategoriaBasicaResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Buscar categorias quando o modal abrir
    useEffect(() => {
        if (modalVisible) {
            buscarCategorias();
        }
    }, [modalVisible, tipoTransacao])

    const buscarCategorias = async (): Promise<void> => {
        try {
            setLoading(true);
            const categorias = await CategoriaService.listarCategoria();
            
            // Filtrar por tipo
            const categoriasFiltradas = categorias.filter(
                cat => cat.tipo === tipoTransacao
            );
            setCategorias(categoriasFiltradas);

        } catch (error) {
            setCategorias([]); // Garantir que seja array vazio em caso de erro
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (): void => {
        setModalVisible(true);
        setCriandoNova(false);
    };

    const fecharModal = (): void => {
        setModalVisible(false);
        setCriandoNova(false);
    };

    const selecionarCategoria = (categoria: CategoriaBasicaResponse): number => {
        setCategoriaSelecionada(categoria);
        fecharModal();
        return categoria.id;
    };

    const iniciarCriacao = (): void => {
        setCriandoNova(true);
    };

    const criarCategoria = async (nome: string): Promise<number> => {
        try {
            setLoading(true);
            
            // Cria a categoria
            await CategoriaService.criarCategoria(nome, tipoTransacao);
            
            // Busca as categorias atualizadas
            const categoriasAtualizadas = await CategoriaService.listarCategoria();
            const categoriasFiltradas = categoriasAtualizadas.filter(
                cat => cat.tipo === tipoTransacao
            );
            
            // Encontra a categoria recém-criada nas categorias atualizadas
            const novaCategoria = categoriasFiltradas.find(cat => 
                cat.nome === nome && cat.tipo === tipoTransacao
            );
            
            if (!novaCategoria) {
                throw new Error('Erro ao encontrar categoria criada');
            }
            
            // Atualiza o estado com as categorias atualizadas
            setCategorias(categoriasFiltradas);
            selecionarCategoria(novaCategoria);
            return novaCategoria.id;
            
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        modalVisible,
        categoriaSelecionada,
        criandoNova,
        categorias,
        loading,
        abrirModal,
        fecharModal,
        selecionarCategoria,
        iniciarCriacao,
        criarCategoria
    };
};