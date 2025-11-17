import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  tipoViagemContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tipoViagemButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tipoViagemButtonActive: {
    backgroundColor: '#1E40AF',
  },
  tipoViagemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tipoViagemTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputTextContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  inputText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flexShrink: 1,
  },
  inputTextPlaceholder: {
    fontWeight: '400',
    color: '#9CA3AF',
  },
  trocarButton: {
    padding: 4,
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  passageirosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
  },
  passageirosLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  passageirosButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  passageirosButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passageirosValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    minWidth: 30,
    textAlign: 'center',
  },
  buscarButton: {
    flexDirection: 'row',
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buscarButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  buscarButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

