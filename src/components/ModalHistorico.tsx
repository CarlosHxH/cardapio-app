import { useState } from "react";
import { formatDate } from "../lib/utils";
import Modal from "./Modal";
import { Calendar } from "lucide-react";
import { buscarDatas } from "../hooks/usePedidos";

export function ModalHistorico({ dataSel, setDataSel }: { dataSel: string; setDataSel: (data: string) => void }) {
    const [open, setOpen] = useState(false)
    const [datas, setDatas] = useState<{ data: string; total: number }[]>([])

    async function handleShowDatas() {
        const d = await buscarDatas()
        setDatas(d)
        setOpen(true)
    }

    return (
        <>
            <button onClick={handleShowDatas}
                className="no-print flex items-center gap-1.5 border border-stone-200 text-stone-600 font-semibold text-sm py-2 px-3 rounded-xl hover:bg-stone-50 transition">
                <Calendar className="w-3.5 h-3.5" /> Histórico
            </button>
            {open && (
                <Modal size="sm" onClose={() => setOpen(false)} title={<h2 className="text-lg font-bold font-display text-stone-800">Histórico</h2>}>
                    {datas.length === 0
                        ? <p className="py-8 text-sm text-center text-stone-400">Nenhum registro.</p>
                        : datas.map(d => (
                            <button key={d.data} onClick={() => { setDataSel(d.data); setOpen(false) }}
                                className={`w-full flex justify-between items-center px-4 py-3 hover:bg-stone-50 transition border-b border-stone-100 ${dataSel === d.data ? 'bg-brand-50' : ''}`}>
                                <span className="text-sm font-medium capitalize text-stone-700">{formatDate(d.data)}</span>
                                <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{d.total} item(s)</span>
                            </button>
                        ))
                    }
                </Modal>
            )}
        </>
    )
}
