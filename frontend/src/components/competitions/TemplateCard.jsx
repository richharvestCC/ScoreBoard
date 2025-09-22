import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const TemplateCard = ({
  template,
  onEdit,
  onDelete,
  onCreateFromTemplate,
  onView,
  canEdit = false
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

  const getLevelColor = (level) => {
    const colors = {
      local: 'default',
      regional: 'primary',
      national: 'secondary',
      international: 'error'
    };
    return colors[level] || 'default';
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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              lineHeight: 1.2,
              flex: 1,
              mr: 1
            }}
          >
            {template.name}
          </Typography>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{ mt: -0.5 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip
            label={getCompetitionTypeLabel(template.competition_type)}
            size="small"
            variant="outlined"
          />
          <Chip
            label={getFormatLabel(template.format)}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={getLevelLabel(template.level)}
            size="small"
            color={getLevelColor(template.level)}
          />
        </Box>

        {template.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
              mb: 2
            }}
          >
            {template.description}
          </Typography>
        )}

        <Box display="flex" gap={2} mb={1}>
          {template.max_participants && (
            <Typography variant="caption" color="text.secondary">
              최대 참가: {template.max_participants}팀
            </Typography>
          )}
          {template.entry_fee > 0 && (
            <Typography variant="caption" color="text.secondary">
              참가비: {template.entry_fee?.toLocaleString()}원
            </Typography>
          )}
        </Box>

        {template.admin && (
          <Typography variant="caption" color="text.secondary">
            작성자: {template.admin.name}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<CopyIcon />}
          onClick={() => onCreateFromTemplate(template)}
          fullWidth
        >
          템플릿으로 대회 만들기
        </Button>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { onView(template); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          자세히 보기
        </MenuItem>
        {canEdit && (
          <>
            <MenuItem onClick={() => { onEdit(template); handleMenuClose(); }}>
              <EditIcon sx={{ mr: 1 }} fontSize="small" />
              편집
            </MenuItem>
            <MenuItem
              onClick={() => { onDelete(template); handleMenuClose(); }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
              삭제
            </MenuItem>
          </>
        )}
      </Menu>
    </Card>
  );
};

export default TemplateCard;