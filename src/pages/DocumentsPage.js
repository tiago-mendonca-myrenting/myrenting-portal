import { useState, useEffect, useCallback } from 'react';
import { api } from '../context/AuthContext';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  Download,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  File,
  Image as ImageIcon
} from 'lucide-react';

const TIPOS_DOCUMENTO = [
  'Cartão de Cidadão',
  'Carta de Condução',
  'Comprovativo de Morada',
  'Recibos de Vencimento',
  'IRS',
  'IES',
  'Extrato Bancário',
  'Certidão Permanente',
  'Declaração IVA',
  'Identificação do Gerente',
  'Mapa de Responsabilidades Banco de Portugal',
  'Outros'
];

const DocumentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [tipoCliente, setTipoCliente] = useState('particular');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, checklistRes] = await Promise.all([
        api.get('/documents'),
        api.get('/documents/checklist')
      ]);
      setDocuments(docsRes.data);
      setChecklist(checklistRes.data.checklist);
      setTipoCliente(checklistRes.data.tipo_cliente);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) {
      toast.error('Selecione o tipo e o ficheiro');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('tipo_documento', selectedType);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Documento enviado com sucesso!');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedType('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erro ao descarregar documento');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejeitado':
      case 'precisa_de_mais_info':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'submetido':
      case 'em_verificacao':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-red-500" />;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#224c57]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8" data-testid="documents-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Os Meus Documentos
            </h1>
            <p className="text-slate-500 mt-1">
              Gerir e carregar documentos para o processo de renting
            </p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#224c57] hover:bg-[#224c57]/90 gap-2" data-testid="open-upload-dialog">
                <Upload className="h-4 w-4" />
                Carregar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Carregar Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Documento *</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger data-testid="document-type-select">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_DOCUMENTO.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ficheiro *</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-[#40eea4] bg-[#40eea4]/10'
                        : 'border-slate-200 hover:border-[#224c57]/50'
                    }`}
                    data-testid="dropzone"
                  >
                    <input {...getInputProps()} data-testid="file-input" />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        {getFileIcon(selectedFile.name)}
                        <div className="text-left">
                          <p className="text-sm font-medium text-slate-700">{selectedFile.name}</p>
                          <p className="text-xs text-slate-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500">
                          Arraste o ficheiro ou <span className="text-[#224c57] font-medium">clique para selecionar</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG ou PNG até 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !selectedType}
                  className="w-full bg-[#224c57] hover:bg-[#224c57]/90"
                  data-testid="upload-submit"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    'Enviar Documento'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Checklist */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Checklist de Documentos ({tipoCliente === 'empresa' ? 'Empresa' : 'Particular'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {checklist.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    item.status === 'aprovado'
                      ? 'border-green-200 bg-green-50'
                      : item.status === 'rejeitado' || item.status === 'precisa_de_mais_info'
                      ? 'border-orange-200 bg-orange-50'
                      : item.status === 'submetido' || item.status === 'em_verificacao'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 truncate">{item.tipo}</p>
                      <StatusBadge status={item.status} className="mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#224c57]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Documentos Submetidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Ainda não submeteu nenhum documento</p>
                <Button
                  onClick={() => setUploadDialogOpen(true)}
                  className="bg-[#224c57] hover:bg-[#224c57]/90"
                >
                  Carregar Primeiro Documento
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {getFileIcon(doc.filename)}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-700 truncate">{doc.tipo_documento}</p>
                        <p className="text-sm text-slate-400 truncate">{doc.filename}</p>
                        {doc.notas_visiveis && doc.notas_admin && (
                          <p className="text-sm text-orange-600 mt-1">{doc.notas_admin}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={doc.estado_documento} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc)}
                        className="text-slate-500 hover:text-[#224c57]"
                        data-testid={`download-doc-${doc.id}`}
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DocumentsPage;
