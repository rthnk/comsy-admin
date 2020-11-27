
import { generateCrudState } from "./crud-gen";

const usersModule = generateCrudState('users');

export default {
  ...usersModule
}
