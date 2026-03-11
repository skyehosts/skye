import { Box, Divider, Typography } from '@mui/material';
import { HeadingPanel } from '@repo/web-components/layout/heading-panel';
import { PrincipalColumn } from '@repo/web-components/layout/principal-column';

const textSectionSx = {
  color: 'grey.700',
  '&:last-child .section-divider': {
    display: 'none',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <HeadingPanel title="Terms of service" />
      <PrincipalColumn>
        <Typography variant="body1" component="div">
          <Box component="section" sx={textSectionSx}>
            <Typography variant="h5" sx={{ mt: '20px', mb: '10px' }}>
              1. Lorem ipsum dolor sit amet
            </Typography>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
              fermentum neque vel pretium placerat. Sed eleifend, magna nec
              accumsan convallis, diam enim sollicitudin mi, eget tempor mauris
              purus quis augue.
            </p>
            <Divider
              className="section-divider"
              sx={{
                width: '40px',
                height: '3px',
                my: '30px',
                bgcolor: 'primary.main',
                border: 'none',
              }}
            />
          </Box>
          <Box component="section" sx={textSectionSx}>
            <Typography variant="h5" sx={{ mt: '20px', mb: '10px' }}>
              2. Lorem ipsum dolor sit amet
            </Typography>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
              fermentum neque vel pretium placerat. Sed eleifend, magna nec
              accumsan convallis, diam enim sollicitudin mi, eget tempor mauris
              purus quis augue.
            </p>
            <Divider
              className="section-divider"
              sx={{
                width: '40px',
                height: '3px',
                my: '30px',
                bgcolor: 'primary.main',
                border: 'none',
              }}
            />
          </Box>
        </Typography>
      </PrincipalColumn>
    </>
  );
}
