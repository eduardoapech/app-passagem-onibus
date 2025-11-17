import { MetaBasicaResponse } from "@/src/interfaces/meta/response";
import { MetaService } from "@/src/services/api/metas";
import { useEffect, useState } from "react";


export const useSelecaoMeta = () => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [metaSelecionada, setMetaSelecionada] = useState<MetaBasicaResponse | null>(null);
    const [metas, setMetas] = useState<MetaBasicaResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Buscar metas quando o modal abrir
    useEffect(() => {
        if (modalVisible) {
            buscarMetas();
        }
    }, [modalVisible]);

    const buscarMetas = async (): Promise<void> => {
        try {
            setLoading(true);
            const metas = await MetaService.listarMetas();
            setMetas(metas);

        } catch (error) {
            console.error('Erro ao buscar metas:', error);
            setMetas([]); // Garantir que seja array vazio em caso de erro
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (): void => {
        setModalVisible(true);
    };

    const fecharModal = (): void => {
        setModalVisible(false);
    };

    const selecionarMeta = (meta: MetaBasicaResponse | null): void => {
        setMetaSelecionada(meta);
        fecharModal();
    };

    return {
        modalVisible,
        metaSelecionada,
        metas,
        loading,
        abrirModal,
        fecharModal,
        selecionarMeta
    };
}