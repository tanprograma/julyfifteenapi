export class InventoryModule {
  constructor(model) {
    this.model = model;
  }
  updateBeginningInventory(resource, beginning) {
    resource.beggining = beginning;
    return resource.save();
  }
}
