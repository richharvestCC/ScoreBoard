import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Groups as GroupsIcon,
  PersonAdd as JoinIcon,
  PersonRemove as LeaveIcon,
  Check as ApproveIcon,
  Close as RejectIcon
} from '@mui/icons-material';

const ParticipantList = ({
  participants = [],
  loading = false,
  canManage = false,
  canJoin = false,
  onJoin,
  onLeave,
  onUpdateStatus,
  searchValue = '',
  onSearchChange
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, participant: null });

  const handleMenuOpen = (event, participant) => {
    setAnchorEl(event.currentTarget);
    setSelectedParticipant(participant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedParticipant(null);
  };

  const handleAction = (action) => {
    setConfirmDialog({
      open: true,
      action,
      participant: selectedParticipant
    });
    handleMenuClose();
  };

  const executeAction = async () => {
    const { action, participant } = confirmDialog;

    try {
      switch (action) {
        case 'approve':
          await onUpdateStatus(participant.club.id, 'approved');
          break;
        case 'reject':
          await onUpdateStatus(participant.club.id, 'rejected');
          break;
        case 'remove':
          await onLeave(participant.club.id);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    }

    setConfirmDialog({ open: false, action: null, participant: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'withdrawn': return 'default';
      case 'registered':
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return '승인됨';
      case 'rejected': return '거부됨';
      case 'withdrawn': return '철회됨';
      case 'registered':
      default:
        return '대기중';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'approve': return '승인';
      case 'reject': return '거부';
      case 'remove': return '제거';
      default: return action;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>참가자 목록을 불러오는 중...</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupsIcon color="primary" />
            참가 팀 목록
          </Typography>
          {canJoin && (
            <Button
              variant="contained"
              startIcon={<JoinIcon />}
              onClick={onJoin}
              size="small"
            >
              참가 신청
            </Button>
          )}
        </Box>

        {/* 검색창 */}
        <TextField
          fullWidth
          size="small"
          placeholder="팀명으로 검색..."
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {participants.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <GroupsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            참가 신청한 팀이 없습니다
          </Typography>
          <Typography color="text.secondary">
            {searchValue ? '검색 결과가 없습니다.' : '아직 참가 신청한 팀이 없습니다.'}
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {participants.map((participant, index) => (
            <ListItem
              key={participant.id}
              divider={index < participants.length - 1}
              sx={{
                '&:hover': canManage ? { backgroundColor: 'grey.50' } : {}
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={participant.club.logo_url}
                  sx={{ bgcolor: 'primary.main' }}
                >
                  {participant.club.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {participant.club.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={getStatusLabel(participant.status)}
                      color={getStatusColor(participant.status)}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {participant.club.club_type} •
                      신청일: {new Date(participant.registration_date).toLocaleDateString('ko-KR')}
                    </Typography>
                    {participant.club.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {participant.club.description}
                      </Typography>
                    )}
                  </Box>
                }
              />

              {canManage && (
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, participant)}
                  >
                    <MoreIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      )}

      {/* 관리 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedParticipant?.status === 'registered' && [
          <MenuItem key="approve" onClick={() => handleAction('approve')}>
            <ApproveIcon sx={{ mr: 1 }} />
            승인
          </MenuItem>,
          <MenuItem key="reject" onClick={() => handleAction('reject')}>
            <RejectIcon sx={{ mr: 1 }} />
            거부
          </MenuItem>
        ]}
        <MenuItem onClick={() => handleAction('remove')}>
          <LeaveIcon sx={{ mr: 1 }} />
          제거
        </MenuItem>
      </Menu>

      {/* 확인 다이얼로그 */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null, participant: null })}
      >
        <DialogTitle>
          {getActionText(confirmDialog.action)} 확인
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            정말로 "{confirmDialog.participant?.club.name}" 팀을 {getActionText(confirmDialog.action)}하시겠습니까?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, action: null, participant: null })}
          >
            취소
          </Button>
          <Button
            onClick={executeAction}
            color="primary"
            variant="contained"
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ParticipantList;