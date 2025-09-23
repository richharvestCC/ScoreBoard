import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Fab,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { competitionAPI } from '../services/api';
import TemplateCard from '../components/competitions/TemplateCard';
import CreateTemplateDialog from '../components/competitions/CreateTemplateDialog';
import CreateFromTemplateDialog from '../components/competitions/CreateFromTemplateDialog';
import { useAuth } from '../hooks/useAuth';

const TemplateManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State for dialogs and UI
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [createFromTemplateOpen, setCreateFromTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch templates
  const {
    data: templates = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['templates'],
    queryFn: () => competitionAPI.getTemplates().then(res => res.data.data)
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: competitionAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      setSnackbar({
        open: true,
        message: '템플릿이 성공적으로 삭제되었습니다.',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || '템플릿 삭제에 실패했습니다.',
        severity: 'error'
      });
    }
  });

  // Event handlers
  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    setEditingTemplate(null);
    setSnackbar({
      open: true,
      message: editingTemplate ? '템플릿이 수정되었습니다.' : '새 템플릿이 생성되었습니다.',
      severity: 'success'
    });
  };

  const handleCreateFromTemplateSuccess = () => {
    setCreateFromTemplateOpen(false);
    setSelectedTemplate(null);
    setSnackbar({
      open: true,
      message: '템플릿으로부터 대회가 생성되었습니다.',
      severity: 'success'
    });
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setCreateDialogOpen(true);
  };

  const handleDelete = (template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleCreateFromTemplate = (template) => {
    setSelectedTemplate(template);
    setCreateFromTemplateOpen(true);
  };

  const handleView = (template) => {
    setViewingTemplate(template);
    setViewDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id);
    }
  };

  // Helper functions
  const getCompetitionTypeLabel = (type) => {
    const types = {
      league: '리그',
      tournament: '토너먼트',
      cup: '컵대회'
    };
    return types[type] || type;
  };

  const getFormatLabel = (format) => {
    const formats = {
      round_robin: '리그전',
      knockout: '토너먼트',
      mixed: '혼합',
      group_knockout: '조별예선+결승토너먼트'
    };
    return formats[format] || format;
  };

  const getLevelLabel = (level) => {
    const levels = {
      local: '지역',
      regional: '광역',
      national: '전국',
      international: '국제'
    };
    return levels[level] || level;
  };

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if user can edit templates (admin or creator)
  const canEditTemplate = (template) => {
    return user && (user.role === 'admin' || template.created_by === user.id);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          대회 템플릿 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ ml: 2 }}
        >
          템플릿 만들기
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="템플릿 이름이나 설명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          템플릿을 불러오는데 실패했습니다: {error.message}
        </Alert>
      )}

      {/* Templates Grid */}
      {!isLoading && !error && (
        <>
          {filteredTemplates.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? '검색 결과가 없습니다' : '아직 생성된 템플릿이 없습니다'}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {searchQuery ? '다른 검색어로 시도해보세요' : '첫 번째 템플릿을 만들어보세요'}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  템플릿 만들기
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredTemplates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <TemplateCard
                    template={template}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreateFromTemplate={handleCreateFromTemplate}
                    onView={handleView}
                    canEdit={canEditTemplate(template)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add template"
        onClick={() => setCreateDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create/Edit Template Dialog */}
      <CreateTemplateDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingTemplate(null);
        }}
        onSuccess={handleCreateSuccess}
        editingTemplate={editingTemplate}
      />

      {/* Create From Template Dialog */}
      <CreateFromTemplateDialog
        open={createFromTemplateOpen}
        onClose={() => {
          setCreateFromTemplateOpen(false);
          setSelectedTemplate(null);
        }}
        onSuccess={handleCreateFromTemplateSuccess}
        template={selectedTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>템플릿 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            '{templateToDelete?.name}' 템플릿을 정말 삭제하시겠습니까?
            이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteMutation.isLoading}
          >
            취소
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
            startIcon={deleteMutation.isLoading ? <CircularProgress size={16} /> : null}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>템플릿 상세 정보</DialogTitle>
        <DialogContent>
          {viewingTemplate && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {viewingTemplate.name}
              </Typography>

              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip
                  label={getCompetitionTypeLabel(viewingTemplate.competition_type)}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={getFormatLabel(viewingTemplate.format)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={getLevelLabel(viewingTemplate.level)}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>

              {viewingTemplate.description && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>설명</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {viewingTemplate.description}
                  </Typography>
                </Box>
              )}

              {viewingTemplate.rules && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>대회 규정</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {viewingTemplate.rules}
                  </Typography>
                </Box>
              )}

              <Grid container spacing={2}>
                {viewingTemplate.max_participants && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">최대 참가팀</Typography>
                    <Typography variant="body2">{viewingTemplate.max_participants}팀</Typography>
                  </Grid>
                )}

                {viewingTemplate.entry_fee > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">참가비</Typography>
                    <Typography variant="body2">{viewingTemplate.entry_fee.toLocaleString()}원</Typography>
                  </Grid>
                )}

                {viewingTemplate.prize_description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>상금/상품</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {viewingTemplate.prize_description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            닫기
          </Button>
          {viewingTemplate && (
            <Button
              variant="contained"
              onClick={() => {
                setViewDialogOpen(false);
                handleCreateFromTemplate(viewingTemplate);
              }}
            >
              이 템플릿으로 대회 만들기
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TemplateManagement;