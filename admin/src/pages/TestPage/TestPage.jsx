import React, { useState } from 'react';
import axios from 'axios';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack
} from '@mui/material';

const STATUS = {
  INIT: 'N/A',
  WAITING: 'Waiting...',
  ERROR: 'Error',
  DONE: 'Completed!'
};

const TestPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [status, setStatus] = useState({
    evaluate: STATUS.INIT,
    distribute: STATUS.INIT,
    ragEmbed: STATUS.INIT,
    recommendPrepare: STATUS.INIT,
    recommendTrain: STATUS.INIT
  });

  const handleToggleMenu = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  const runTest = async (key, request) => {
    try {
      setStatus((prev) => ({ ...prev, [key]: STATUS.WAITING }));
      await request();
      setStatus((prev) => ({ ...prev, [key]: STATUS.DONE }));
    } catch (err) {
      setStatus((prev) => ({ ...prev, [key]: STATUS.ERROR }));
    }
  };

  return (
    <div className="flex h-screen">
      <SideNav onToggleCollapse={handleToggleMenu} />

      <main
        className="flex-1 bg-gray-100 relative flex flex-col transition-all duration-300"
        style={{ paddingLeft: isCollapsed ? '5%' : '16.5%' }}
      >
        <Header
          title="TEST PAGE"
          isCollapsed={isCollapsed}
          className="sticky top-0 z-50 bg-white shadow-md"
        />

        <Box className="p-6 space-y-6">

          {/* ===== TEST SECTION ===== */}
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Test
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  onClick={() =>
                    runTest('evaluate', () =>
                      axios.post('http://localhost:8082/api/ranks/test/evaluate')
                    )
                  }
                >
                  Evaluate
                </Button>
                <Typography>
                  status: {status.evaluate}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  onClick={() =>
                    runTest('distribute', () =>
                      axios.post('http://localhost:8082/api/ranks/test/distribute')
                    )
                  }
                >
                  Distribute
                </Button>
                <Typography>
                  status: {status.distribute}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* ===== TRAIN SECTION ===== */}
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Train
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  onClick={() =>
                    runTest('ragEmbed', () =>
                      axios.post('http://localhost:8085/embed')
                    )
                  }
                >
                  RAG_Embeded
                </Button>
                <Typography>
                  status: {status.ragEmbed}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  onClick={() =>
                    runTest('recommendPrepare', () =>
                      axios.post('http://localhost:8086/recommend/prepare_dataset')
                    )
                  }
                >
                  Recommend_Prepare
                </Button>
                <Typography>
                  status: {status.recommendPrepare}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  onClick={() =>
                    runTest('recommendTrain', () =>
                      axios.post('http://localhost:8086/recommend/train')
                    )
                  }
                >
                  Recommend_Train
                </Button>
                <Typography>
                  status: {status.recommendTrain}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

        </Box>
      </main>
    </div>
  );
};

export default TestPage;
