import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Typography,
  Avatar,
  Tooltip,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  Verified as VerifiedIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';

const UserManagement = () => {
  const queryClient = useQueryClient();

  // State for filters and pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    is_active: ''
  });

  // State for dialogs
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [viewUserDialog, setViewUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    role: '',
    is_active: true
  });

  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch users with filters
  const {
    data: usersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['adminUsers', page, rowsPerPage, filters],
    queryFn: () => adminAPI.getAllUsers({
      page: page + 1,
      limit: rowsPerPage,
      ...filters
    }).then(res => res.data.data)
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      setEditUserDialog(false);
      setSnackbar({
        open: true,
        message: '사용자 정보가 성공적으로 업데이트되었습니다.',
        severity: 'success'
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || '사용자 업데이트에 실패했습니다.',
        severity: 'error'
      });
    }
  });

  // Event handlers
  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(0); // Reset to first page when filtering
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
      role: user.role,
      is_active: user.is_active
    });
    setEditUserDialog(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewUserDialog(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      updateUserMutation.mutate({
        id: selectedUser.id,
        data: userFormData
      });
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      user: '일반 사용자',
      organizer: '주최자',
      moderator: '운영자',
      admin: '관리자'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      user: 'default',
      organizer: 'primary',
      moderator: 'secondary',
      admin: 'error'
    };
    return colors[role] || 'default';
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminIcon fontSize="small" />;
      case 'moderator':
        return <VerifiedIcon fontSize="small" />;
      case 'organizer':
        return <PersonAddIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        사용자 목록을 불러오는데 실패했습니다: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        사용자 관리
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="이름, 이메일, 사용자 ID로 검색..."
            value={filters.search}
            onChange={handleFilterChange('search')}
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>역할</InputLabel>
            <Select
              value={filters.role}
              onChange={handleFilterChange('role')}
              label="역할"
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="user">일반 사용자</MenuItem>
              <MenuItem value="organizer">주최자</MenuItem>
              <MenuItem value="moderator">운영자</MenuItem>
              <MenuItem value="admin">관리자</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>상태</InputLabel>
            <Select
              value={filters.is_active}
              onChange={handleFilterChange('is_active')}
              label="상태"
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="true">활성</MenuItem>
              <MenuItem value="false">비활성</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>사용자</TableCell>
                    <TableCell>역할</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell>마지막 로그인</TableCell>
                    <TableCell>가입일</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersData?.users?.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={user.profile_image_url}
                            sx={{ width: 40, height: 40 }}
                          >
                            {user.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.user_id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleLabel(user.role)}
                          color={getRoleColor(user.role)}
                          size="small"
                          icon={getRoleIcon(user.role)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? '활성' : '비활성'}
                          color={user.is_active ? 'success' : 'error'}
                          size="small"
                          icon={user.is_active ? <VerifiedIcon /> : <BlockIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString('ko-KR')
                          : '없음'
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="상세보기">
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="편집">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={usersData?.pagination?.total || 0}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="페이지당 행 수:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} / ${count !== -1 ? count : `more than ${to}`}`
              }
            />
          </>
        )}
      </Paper>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog} onClose={() => setEditUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>사용자 정보 수정</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                {selectedUser.name} ({selectedUser.email})
              </Typography>

              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>역할</InputLabel>
                <Select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                  label="역할"
                >
                  <MenuItem value="user">일반 사용자</MenuItem>
                  <MenuItem value="organizer">주최자</MenuItem>
                  <MenuItem value="moderator">운영자</MenuItem>
                  <MenuItem value="admin">관리자</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={userFormData.is_active}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                }
                label="계정 활성화"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog(false)}>
            취소
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={updateUserMutation.isLoading}
          >
            {updateUserMutation.isLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewUserDialog} onClose={() => setViewUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>사용자 상세 정보</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar
                  src={selectedUser.profile_image_url}
                  sx={{ width: 60, height: 60 }}
                >
                  {selectedUser.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {selectedUser.user_id}
                  </Typography>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>기본 정보</Typography>
                <Typography variant="body2">역할: {getRoleLabel(selectedUser.role)}</Typography>
                <Typography variant="body2">상태: {selectedUser.is_active ? '활성' : '비활성'}</Typography>
                <Typography variant="body2">
                  생년월일: {selectedUser.birthdate || '없음'}
                </Typography>
                <Typography variant="body2">
                  성별: {selectedUser.gender ? (selectedUser.gender === 'male' ? '남성' : selectedUser.gender === 'female' ? '여성' : '기타') : '없음'}
                </Typography>
                <Typography variant="body2">
                  전화번호: {selectedUser.phone_number || '없음'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>활동 정보</Typography>
                <Typography variant="body2">
                  마지막 로그인: {selectedUser.last_login_at
                    ? new Date(selectedUser.last_login_at).toLocaleString('ko-KR')
                    : '없음'
                  }
                </Typography>
                <Typography variant="body2">
                  가입일: {new Date(selectedUser.createdAt).toLocaleString('ko-KR')}
                </Typography>
                <Typography variant="body2">
                  정보 수정일: {new Date(selectedUser.updatedAt).toLocaleString('ko-KR')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUserDialog(false)}>닫기</Button>
          <Button
            onClick={() => {
              setViewUserDialog(false);
              handleEditUser(selectedUser);
            }}
            variant="contained"
          >
            편집
          </Button>
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
    </Box>
  );
};

export default UserManagement;