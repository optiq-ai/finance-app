import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Container } from '@mui/material';
import ApiDiagnosticTool from '../../components/ApiDiagnosticTool';
import DirectDataLoader from '../../components/DirectDataLoader';
import DataFlowTester from '../../components/DataFlowTester';

// Komponent strony diagnostycznej
const DiagnosticPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Narzędzia diagnostyczne
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="diagnostic tabs">
            <Tab label="Diagnostyka API" />
            <Tab label="Bezpośrednie ładowanie danych" />
            <Tab label="Tester przepływu danych" />
          </Tabs>
        </Box>
        
        {activeTab === 0 && (
          <ApiDiagnosticTool />
        )}
        
        {activeTab === 1 && (
          <DirectDataLoader />
        )}
        
        {activeTab === 2 && (
          <DataFlowTester />
        )}
      </Box>
    </Container>
  );
};

export default DiagnosticPage;
