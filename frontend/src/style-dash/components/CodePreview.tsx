import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Code,
  Visibility,
  ContentCopy,
  CheckCircle,
} from '@mui/icons-material';

interface CodePreviewProps {
  title: string;
  description?: string;
  preview: React.ReactNode;
  code: string;
  language?: 'tsx' | 'css' | 'javascript';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ height: '100%' }}>
      {value === index && children}
    </div>
  );
};

/**
 * CodePreview Component
 * 컴포넌트의 실제 렌더링과 코드를 동시에 보여주는 컴포넌트
 */
const CodePreview: React.FC<CodePreviewProps> = ({
  title,
  description,
  preview,
  code,
  language = 'tsx',
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const syntaxHighlight = (code: string, language: string) => {
    // 간단한 구문 강조 (실제 환경에서는 prism.js나 highlight.js 사용)
    return (
      <Box
        component="pre"
        sx={{
          margin: 0,
          padding: theme.spacing(2),
          backgroundColor: alpha(theme.palette.text.primary, 0.05),
          color: theme.palette.text.primary,
          fontSize: '0.875rem',
          fontFamily: 'Monaco, "SF Mono", "Cascadia Code", "Roboto Mono", monospace',
          lineHeight: 1.6,
          overflow: 'auto',
          borderRadius: 1,
          '& .keyword': {
            color: theme.palette.primary.main,
            fontWeight: 600,
          },
          '& .string': {
            color: theme.palette.success.main,
          },
          '& .comment': {
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
          },
        }}
      >
        <code>{code}</code>
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
        }}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: description ? 0.5 : 0,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ lineHeight: 1.5 }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<Visibility />}
            iconPosition="start"
            label="Preview"
            sx={{ minWidth: 120 }}
          />
          <Tab
            icon={<Code />}
            iconPosition="start"
            label="Code"
            sx={{ minWidth: 120 }}
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ position: 'relative', minHeight: 200 }}>
        <TabPanel value={activeTab} index={0}>
          <Box
            sx={{
              p: 3,
              minHeight: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.background.default, 0.3),
            }}
          >
            {preview}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                top: theme.spacing(1),
                right: theme.spacing(1),
                zIndex: 1,
              }}
            >
              <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                <IconButton
                  size="small"
                  onClick={handleCopyCode}
                  sx={{
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.paper, 1),
                    },
                  }}
                >
                  {copied ? (
                    <CheckCircle color="success" />
                  ) : (
                    <ContentCopy />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
            {syntaxHighlight(code, language)}
          </Box>
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default CodePreview;