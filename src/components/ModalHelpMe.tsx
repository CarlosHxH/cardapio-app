import Modal from './Modal'

const PASSOS = [
  { n: '1', t: 'Preencha seus dados', d: 'Informe seu nome e o setor onde trabalha.' },
  { n: '2', t: 'Veja o menu do dia',  d: 'Confira as opções disponíveis.' },
  { n: '3', t: 'Monte sua marmita',   d: 'Escolha o tamanho e opção (1 ou 2) e clique em Adicionar.' },
  { n: '4', t: 'Extras e bebidas',    d: 'Use os botões + para incluir adicionais e bebidas.' },
  { n: '5', t: 'Envie o pedido',      d: 'Clique em Enviar Pedido. O restaurante recebe na hora!' },
]

export default function ModalHelpMe({ isOpen ,onClose }: { isOpen: boolean,onClose: () => void }) {
    if(!isOpen) return;
    return (
        <Modal
            align="bottom"
            onClose={onClose}
            title={<h2 className="font-display font-bold text-lg text-brand-700">Como usar</h2>}
            footer={
                <div className="p-4 border-t">
                <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition">Entendi!</button>
                </div>
            }
            >
            <div className="p-5 space-y-4 text-sm text-stone-600">
                {PASSOS.map(s => (
                <div key={s.n} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-black flex items-center justify-center shrink-0 text-sm">{s.n}</div>
                    <div><p className="font-bold text-stone-800 mb-0.5">{s.t}</p><p className="text-stone-500">{s.d}</p></div>
                </div>
                ))}
            </div>
        </Modal>
    )
}
