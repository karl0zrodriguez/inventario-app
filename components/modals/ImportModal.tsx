import React, { useState, useCallback } from 'react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (csvData: string) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);


  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv') {
        setError('Por favor, seleccione un archivo .csv');
        setFileContent(null);
        setFileName('');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
        setError('');
      };
      reader.onerror = () => {
        setError('Error al leer el archivo.');
        setFileContent(null);
        setFileName('');
      }
      reader.readAsText(file);
      setFileName(file.name);
    }
  }, []);

  const handleSubmit = async () => {
    if (!fileContent) {
      setError('Por favor, seleccione un archivo para importar.');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      // Use a short timeout to allow the UI to update to the "processing" state
      await new Promise(resolve => setTimeout(resolve, 50));
      onImport(fileContent);
    } catch (e: any) {
      setError(e.message || 'Ocurrió un error desconocido durante la importación.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Importar Productos y Stock</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none bg-slate-100 dark:bg-slate-700 p-4 rounded-md">
            <h4>Instrucciones:</h4>
            <ol>
              <li>Prepare un archivo <strong>.csv</strong> con las siguientes columnas, en este orden: <code>codigo,nombre_del_producto,cantidad,deposito,precio</code>. La primera fila debe ser la cabecera.</li>
              <li>Si el valor de un campo de texto (como <code>nombre_del_producto</code> o <code>deposito</code>) contiene comas, debe encerrar todo el valor entre <strong>comillas simples (')</strong>.</li>
              <li>Si un producto o depósito no existe en el sistema, será creado automáticamente.</li>
              <li>Si un producto ya existe (identificado por su código/SKU), se <strong>actualizará su precio</strong> y la cantidad importada se <strong>sumará</strong> al stock existente en el depósito especificado.</li>
            </ol>
            <p><strong>Ejemplo:</strong></p>
            <pre className="whitespace-pre-wrap"><code>codigo,nombre_del_producto,cantidad,deposito,precio
HDW-001,'Heavy Duty Wrench, 24 inches',25,Main Distribution Center,49.99
PSS-002,Precision Screwdriver Set,50,West Coast Hub,24.50</code></pre>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Seleccionar archivo .csv</label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-bray-800 dark:bg-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-slate-500 dark:text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click para cargar</span> o arrastre el archivo</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">CSV (max. 2MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                </label>
            </div>
            {fileName && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Archivo seleccionado: {fileName}</p>}
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm">Cancelar</button>
          <button onClick={handleSubmit} disabled={!fileContent || isProcessing} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed">
            {isProcessing ? 'Procesando...' : 'Procesar Importación'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;