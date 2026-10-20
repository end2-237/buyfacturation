// Ce qu'une application voit d'une collecte.
export function vue(tx) {
  return {
    reference: tx.provider_tx_id,
    transactionId: tx.id,
    statut: tx.statut,
    montant: Number(tx.montant),
    operateur: tx.operateur,
    raison: tx.raison || null,
  };
}
