import * as React from 'react';
import { Tr, Td } from '@patternfly/react-table';
import { CheckboxTd, ResourceNameTooltip, TableRowTitleDescription } from 'mod-arch-shared';
import { Icon, Label, Popover, Flex, FlexItem, TextInput, FormGroup } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { AIModel } from '~/app/types';
import { convertAIModelToK8sResource } from '~/app/utilities/utils';

type ChatbotConfigurationTableRowProps = {
  model: AIModel;
  isChecked: boolean;
  onToggleCheck: () => void;
  maxTokens?: number;
  onMaxTokensChange: (value: number | undefined) => void;
};

const ChatbotConfigurationTableRow: React.FC<ChatbotConfigurationTableRowProps> = ({
  model,
  isChecked,
  onToggleCheck,
  maxTokens,
  onMaxTokensChange,
}) => {
  // Sanitize model name for testid: remove all characters except alphanumeric and hyphens
  const sanitizedModelName = model.model_name.replace(/[^a-zA-Z0-9-]/g, '');

  // Validation state for max_tokens
  const [maxTokensValue, setMaxTokensValue] = React.useState<string>(maxTokens?.toString() || '');
  const [maxTokensValidated, setMaxTokensValidated] = React.useState<
    'default' | 'success' | 'warning' | 'error'
  >('default');
  const [maxTokensHelperText, setMaxTokensHelperText] = React.useState<string>('');

  // Sync with prop changes
  React.useEffect(() => {
    setMaxTokensValue(maxTokens?.toString() || '');
  }, [maxTokens]);

  const handleMaxTokensChange = React.useCallback(
    (_event: React.FormEvent<HTMLInputElement>, value: string) => {
      setMaxTokensValue(value);

      // If empty, clear the value
      if (value === '') {
        setMaxTokensValidated('default');
        setMaxTokensHelperText('');
        onMaxTokensChange(undefined);
        return;
      }

      const numValue = parseInt(value, 10);

      // Check if it's a valid number
      if (Number.isNaN(numValue)) {
        setMaxTokensValidated('error');
        setMaxTokensHelperText('Must be a valid number');
        return;
      }

      // Validate range
      if (numValue < 128) {
        setMaxTokensValidated('error');
        setMaxTokensHelperText('Minimum: 128');
        return;
      }

      if (numValue > 128000) {
        setMaxTokensValidated('error');
        setMaxTokensHelperText('Maximum: 128,000');
        return;
      }

      // Valid value
      setMaxTokensValidated('success');
      setMaxTokensHelperText('');
      onMaxTokensChange(numValue);
    },
    [onMaxTokensChange],
  );

  return (
    <Tr>
      <CheckboxTd
        id={model.model_name}
        isChecked={isChecked}
        isDisabled={model.status !== 'Running'}
        onToggle={onToggleCheck}
        data-testid={`${sanitizedModelName}-checkbox`}
      />
      <Td dataLabel="Model deployment name">
        <TableRowTitleDescription
          title={
            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                {model.isMaaSModel ? (
                  model.display_name
                ) : (
                  <ResourceNameTooltip resource={convertAIModelToK8sResource(model)}>
                    {model.display_name}
                  </ResourceNameTooltip>
                )}
              </FlexItem>
              {model.isMaaSModel && (
                <FlexItem>
                  <Popover aria-label="Models as a Service" bodyContent={<>Models as a Service</>}>
                    <Label color="orange" aria-label="Model as a Service">
                      MaaS
                    </Label>
                  </Popover>
                </FlexItem>
              )}
            </Flex>
          }
          description={model.description}
          descriptionAsMarkdown
        />
      </Td>
      <Td dataLabel="Status">
        <Icon status={model.status === 'Running' ? 'success' : 'danger'} size="md">
          {model.status === 'Running' ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
        </Icon>
      </Td>
      <Td dataLabel="Use case">{model.usecase}</Td>
      <Td dataLabel="Max tokens">
        {isChecked ? (
          <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <FormGroup
                fieldId={`max-tokens-${sanitizedModelName}`}
                helperText={maxTokensHelperText}
                validated={maxTokensValidated}
                style={{ marginBottom: 0 }}
              >
                <TextInput
                  id={`max-tokens-${sanitizedModelName}`}
                  type="text"
                  value={maxTokensValue}
                  onChange={handleMaxTokensChange}
                  placeholder=""
                  aria-label={`Max tokens for ${model.display_name}`}
                  data-testid={`${sanitizedModelName}-max-tokens-input`}
                  validated={maxTokensValidated}
                  style={{ width: '110px' }}
                />
              </FormGroup>
            </FlexItem>
            <FlexItem>
              <Popover
                aria-label="Max tokens help"
                headerContent="Max tokens"
                bodyContent={
                  <>
                    <p>Configure the maximum number of tokens (context window) for this model.</p>
                    <p style={{ marginTop: '8px' }}>
                      <strong>Valid range:</strong> 128 to 128,000 tokens
                    </p>
                    <p style={{ marginTop: '8px' }}>
                      This setting is optional. If not specified, the model will use its default
                      configuration.
                    </p>
                  </>
                }
              >
                <Icon status="info" size="sm" style={{ cursor: 'pointer' }}>
                  <OutlinedQuestionCircleIcon />
                </Icon>
              </Popover>
            </FlexItem>
          </Flex>
        ) : (
          <span style={{ color: 'var(--pf-v6-global--Color--200)' }}>—</span>
        )}
      </Td>
    </Tr>
  );
};

export default ChatbotConfigurationTableRow;
